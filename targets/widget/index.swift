import WidgetKit
import SwiftUI
import ActivityKit

// 1. 定义数据模型 (Attributes)
// 这个结构体定义了你的灵动岛能显示什么数据
public struct RunAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // 动态数据：跑步过程中会变的
        var distance: Double
        var pace: String
    }
    // 静态数据：开始就不变的
    var runType: String
}

// 2. 编写 UI
@main
struct RunWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: RunAttributes.self) { context in
            // --- A. 锁屏界面 UI ---
            VStack {
                Text("正在跑步")
                    .font(.caption)
                    .foregroundColor(.gray)
                HStack {
                    Text("\(context.state.distance, specifier: "%.2f") km")
                        .font(.system(size: 34, weight: .bold))
                        .foregroundColor(.white)
                    Spacer()
                    Text(context.state.pace)
                        .font(.title2)
                        .foregroundColor(.yellow)
                }
            }
            .padding()
            .activityBackgroundTint(Color.black.opacity(0.8)) // 半透明黑底

        } dynamicIsland: { context in
            // --- B. 灵动岛 UI ---
            DynamicIsland {
                // 展开状态 (长按)
                DynamicIslandExpandedRegion(.leading) {
                    Text("🏃")
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.state.pace)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    Text("距离: \(context.state.distance, specifier: "%.2f") km")
                        .font(.title3)
                }
            } compactLeading: {
                // 收起状态 (左图标)
                Text("🏃")
            } compactTrailing: {
                // 收起状态 (右数据)
                Text("\(context.state.distance, specifier: "%.1f")")
            } minimal: {
                // 极简状态
                Text("🏃")
            }
        }
    }
}
