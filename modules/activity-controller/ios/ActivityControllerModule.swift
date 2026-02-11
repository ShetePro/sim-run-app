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
    Task {
      await cleanUpStaleActivities()
    }
  }
  
  /// 恢复或清理 Activity（App 启动时调用）
  /// 如果 Activity 存在，恢复它并设置过期时间
  @available(iOS 16.1, *)
  private func cleanUpStaleActivities() async {
    // 尝试恢复当前 Activity（如果存在）
    if let existingActivity = Activity<RunAttributes>.activities.first {
      self.currentActivity = existingActivity
      print("🔄 恢复现有 Activity: \(existingActivity.id)")
      
      // 恢复后设置过期任务（1小时后）
      // 如果用户继续跑步，update 会被调用并延长过期时间
      await MainActor.run {
        self.scheduleExpiration()
      }
      print("✅ Activity 已恢复，过期时间已设置")
    }
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
      if #available(iOS 16.1, *),
      let activity = self.currentActivity as? Activity<RunAttributes> {

        let newState = RunAttributes.ContentState(distance: distance, duration: duration, pace: pace)
        Task {
          await activity.update(using: newState)
          // 每次更新时重置过期时间（延长1小时）
          await MainActor.run {
            self.scheduleExpiration()
          }
          print("🔄 Activity 已更新，过期时间已延长1小时")
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
    // App 被杀时，不立即结束 Activity
    // 让它按照 scheduleExpiration 设置的过期时间自动结束
    // 这样如果用户还在跑步（持续更新），Activity 会继续存在
    print("👋 App 被杀，Activity 将在过期后自动关闭（如果不再更新）")
  }
}
