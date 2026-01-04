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
          await activity.end(using: activity.contentState, dismissalPolicy: .default)
          self.currentActivity = nil
          print("🛑 灵动岛已结束")
        }
      }
    }
  }
  @objc
  private func handleAppKill() {
    if #available(iOS 16.1, *) {
      print("💀 App 被强杀，触发最后清理...")

      let semaphore = DispatchSemaphore(value: 0)

      Task {
        for activity in Activity<RunAttributes>.activities {
          print("💀 关闭 ID: \(activity.id)")
          await activity.end(dismissalPolicy: .immediate)
        }
        semaphore.signal()
      }

      _ = semaphore.wait(timeout: .now() + 1.5)
    }
  }
}
