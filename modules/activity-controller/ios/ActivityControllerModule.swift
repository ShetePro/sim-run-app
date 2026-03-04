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
  public required init(appContext: AppContext) {
    super.init(appContext: appContext)

    // kill app
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleAppKill),
      name: UIApplication.willTerminateNotification,
      object: nil
    )
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
        }
      }
    }

    Function("stopLiveActivity") {
      if #available(iOS 16.1, *),
      let activity = self.currentActivity as? Activity<RunAttributes> {

        Task {
          await activity.end(using: activity.contentState, dismissalPolicy: .immediate)
          self.currentActivity = nil
          print("🛑 灵动岛已结束")
        }
      }
    }
  }
  @objc
  private func handleAppKill() {
    if #available(iOS 16.1, *) {
      // 1. 创建一个信号量，初始值为 0
      let semaphore = DispatchSemaphore(value: 0)

      Task {
        // 2. 遍历并关闭所有活动
        for activity in Activity<RunAttributes>.activities {
          print("🛑 正在同步关闭活动 ID: \(activity.id)")
          // 这里必须传入当前的 contentState 作为最终状态，否则有时会报错
          await activity.end(using: activity.contentState, dismissalPolicy: .immediate)
        }

        self.currentActivity = nil
        print("✅ 所有灵动岛及锁屏通知已彻底清理")

        // 3. 异步任务执行完毕，发送信号（+1）
        semaphore.signal()
      }

      // 4. 关键：强行阻塞主线程，等待 Task 完成。
      // 设置一个合理的超时时间（如 2 秒），防止死锁导致 App 崩溃无法退出
      _ = semaphore.wait(timeout: .now() + 2.0)
    }
  }
}
