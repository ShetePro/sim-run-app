import ExpoModulesCore
import ActivityKit


public struct RunAttributes: ActivityAttributes {
  public struct ContentState: Codable, Hashable {
    var distance: Double
    var duration: String
    var pace: String
  }
  var runType: String
}
public class ActivityControllerModule: Module {
  private var currentActivity: Any?
  private var expirationDate: Date?
  private var expirationTask: Task<Void, Never>?
  
  public required init(appContext: AppContext) {
    super.init(appContext: appContext)

    // kill app
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleAppKill),
      name: UIApplication.willTerminateNotification,
      object: nil
    )
    
    // 启动时清理可能残留的 Activity
    if #available(iOS 16.1, *) {
      Task {
        await cleanUpStaleActivities()
      }
    }
  }
  
  /// App 启动时清理残留的 Activity
  /// 如果 Activity 存在但 App 刚刚启动，说明 App 之前被杀，直接结束它
  @available(iOS 16.1, *)
  private func cleanUpStaleActivities() async {
    // 如果存在 Activity，直接结束它（因为 App 刚刚启动，说明之前被杀或重启）
    for activity in Activity<RunAttributes>.activities {
      await activity.end(dismissalPolicy: .immediate)
      print("🧹 App 启动时清理残留的 Activity: \(activity.id)")
    }
    self.currentActivity = nil
  }
  
  /// 设置自动过期任务
  private func scheduleExpiration() {
    // 取消之前的任务
    expirationTask?.cancel()
    
    // 设置新的过期时间（5分钟后）
    expirationDate = Date().addingTimeInterval(300) // 5分钟
    
    expirationTask = Task {
      try? await Task.sleep(nanoseconds: 300 * 1_000_000_000) // 5分钟
      
      await MainActor.run {
        if #available(iOS 16.1, *) {
          Task {
            if let activity = self.currentActivity as? Activity<RunAttributes> {
              await activity.end(dismissalPolicy: .immediate)
              self.currentActivity = nil
              print("⏰ Activity 已自动过期并关闭")
            }
          }
        }
      }
    }
  }
  public func definition() -> ModuleDefinition {
    Name("ActivityController")

    Property("areLiveActivitiesEnabled") {
      if #available(iOS 16.2, *) {
        return ActivityAuthorizationInfo().areActivitiesEnabled
      }
      return false
    }

    // --- 🟢 start ---
    Function("startLiveActivity") {
      if #available(iOS 16.1, *) {
        let attributes = RunAttributes(runType: "户外跑")
        let initialState = RunAttributes.ContentState(distance: 0.00, duration: "0.00", pace: "--")

        do {
          let activity = try Activity.request(
            attributes: attributes,
            contentState: initialState,
            pushType: nil
          )
          self.currentActivity = activity
          // 启动时设置1小时后自动过期
          self.scheduleExpiration()
          print("✅ 灵动岛已开启 ID: \(activity.id)")
        } catch {
          print("❌ 开启失败: \(error)")
        }
      }
    }

    // --- 🔄 update ---
    Function("updateLiveActivity") { (distance: Double, duration: String, pace: String) in
      if #available(iOS 16.1, *) {
        guard let activity = self.currentActivity as? Activity<RunAttributes> else {
          print("⚠️ 没有活动的 Activity，跳过更新")
          return
        }
        
        // 检查 Activity 是否仍然有效
        if activity.activityState != .active {
          print("⚠️ Activity 已结束或无效，跳过更新")
          self.currentActivity = nil
          return
        }

        let newState = RunAttributes.ContentState(distance: distance, duration: duration, pace: pace)
        
        // 使用 @MainActor 确保在主线程执行
        Task { @MainActor in
          do {
            try await activity.update(using: newState)
            // 重置过期时间
            self.scheduleExpiration()
            print("🔄 Activity 已更新，过期时间已延长")
          } catch {
            print("❌ Activity 更新失败: \(error)")
          }
        }
      }
    }

    Function("stopLiveActivity") {
      if #available(iOS 16.1, *),
      let activity = self.currentActivity as? Activity<RunAttributes> {

        Task {
          // 取消自动过期任务
          self.expirationTask?.cancel()
          self.expirationTask = nil
          await activity.end(using: activity.contentState, dismissalPolicy: .immediate)
          self.currentActivity = nil
          print("🛑 灵动岛已结束")
        }
      }
    }
  }
  @objc
  private func handleAppKill() {
    // App 被杀时，立即结束 Activity
    // 注意：willTerminateNotification 是同步的，必须使用信号量阻塞主线程等待异步完成
    if #available(iOS 16.1, *) {
      // 取消自动过期任务
      expirationTask?.cancel()
      
      // 创建信号量，阻塞主线程
      let semaphore = DispatchSemaphore(value: 0)
      
      // 结束所有 Activity（包括可能不在 currentActivity 中的）
      Task {
        for activity in Activity<RunAttributes>.activities {
          await activity.end(dismissalPolicy: .immediate)
          print("🛑 App 被杀，Activity 已结束: \(activity.id)")
        }
        self.currentActivity = nil
        
        // 发送信号，允许主线程继续
        semaphore.signal()
      }
      
      // 阻塞主线程最多 2 秒，等待异步任务完成
      _ = semaphore.wait(timeout: .now() + 2)
      print("✅ App 终止，Live Activity 清理完成")
    }
  }
}
