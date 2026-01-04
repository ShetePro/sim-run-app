import WidgetKit
import SwiftUI
import ActivityKit

public struct RunAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var distance: Double // 公里
        var duration: String // 格式化后的时间 "00:12:30"
        var pace: String     // 配速 "5'30\""
    }
    var runType: String // "户外跑"
}
struct WidgetLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: RunAttributes.self) { context in
            // ==============================
            // 🔒 锁屏界面 (Lock Screen)
            // ==============================
            VStack(alignment: .leading) {
                HStack {
                    Image(systemName: "figure.run")
                    .foregroundColor(.green)
                    Text(context.attributes.runType)
                    .font(.headline)
                    .foregroundColor(.white.opacity(0.8))
                }

                HStack(alignment: .bottom) {
                    VStack(alignment: .leading) {
                        Text(String(format: "%.2f", context.state.distance))
                        .font(.system(size: 48, weight: .heavy, design: .rounded))
                        .foregroundColor(.white)
                        Text("总距离 (km)")
                        .font(.caption2)
                        .foregroundColor(.gray)
                    }

                    Spacer()

                    VStack(alignment: .trailing) {
                        Text(context.state.duration)
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.yellow)
                        Text("用时")
                        .font(.caption2)
                        .foregroundColor(.gray)

                        Spacer().frame(height: 8)

                        Text(context.state.pace)
                        .font(.title3)
                        .fontWeight(.semibold)
                        .foregroundColor(.cyan)
                        Text("配速")
                        .font(.caption2)
                        .foregroundColor(.gray)
                    }
                }
            }
            .padding()
            .activityBackgroundTint(Color.black.opacity(0.8))

        } dynamicIsland: { context in
            // ==============================
            // 🏝️ 灵动岛 (Dynamic Island)
            // ==============================
            DynamicIsland {
                // 展开状态 (长按)
                DynamicIslandExpandedRegion(.leading) {
                    VStack {
                        Image(systemName: "figure.run")
                        .foregroundColor(.green)
                        Text(context.state.pace)
                        .font(.caption)
                        .foregroundColor(.cyan)
                    }
                }
                DynamicIslandExpandedRegion(.trailing) {
                    VStack(alignment: .trailing) {
                        Text(context.state.duration)
                        .font(.headline)
                        .foregroundColor(.yellow)
                        .monospacedDigit()
                    }
                }
                DynamicIslandExpandedRegion(.bottom) {
                    HStack {
                        Text("距离:")
                        .foregroundColor(.gray)
                        Text("\(context.state.distance, specifier: "%.2f") km")
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    }
                }
            } compactLeading: {
                // 收起状态 (左)
                Image(systemName: "figure.run")
                .foregroundColor(.green)
            } compactTrailing: {
                // 收起状态 (右)
                Text("\(context.state.distance, specifier: "%.1f")")
                .foregroundColor(.white)
            } minimal: {
                // 极简状态 (有其他App占用时)
                Image(systemName: "figure.run")
                .foregroundColor(.green)
            }
        }
    }
}
