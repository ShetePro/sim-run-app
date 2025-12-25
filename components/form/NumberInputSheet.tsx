import {
  useState,
  useCallback,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Platform,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import {
  NumberInputSheetHandle,
  NumberInputSheetProps,
} from "@/types/formTypes";

// 定义组件对外暴露的方法类型

const NumberInputSheet = forwardRef<
  NumberInputSheetHandle,
  NumberInputSheetProps
>(({ title, unit, value, onConfirm }, ref) => {
  const sheetRef = useRef<BottomSheet>(null);
  const [inputValue, setInputValue] = useState<string>(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // 设置 Bottom Sheet 的 Snap Points：通常需要一个较大的高度来容纳键盘
  const snapPoints = useMemo(() => ["40%", "70%"], []);

  useImperativeHandle(ref, () => ({
    present: () => {
      setInputValue(value);
      sheetRef.current?.snapToIndex(1);
    }, // 展开到第一个停靠点
    dismiss: () => {
      handleClose();
    },
  }));

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    ),
    [],
  );
  const handleChange = (index: number) => {
    if (index === -1) {
      Keyboard.dismiss();
    }
  };
  const handleConfirm = () => {
    const numericValue = parseFloat(inputValue);
    if (!isNaN(numericValue) && numericValue > 0) {
      onConfirm(numericValue.toString());
      sheetRef.current?.close();
      Keyboard.dismiss(); // 确保关闭键盘
    } else {
      // 简单校验
      alert("请输入有效的数值！");
    }
  };
  const handleClose = () => {
    Keyboard.dismiss();
    sheetRef.current?.close();
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      keyboardBehavior={"extend"}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: "#ccc" }}
      onChange={handleChange}
    >
      <BottomSheetView style={styles.contentContainer}>
        {/* 顶部标题栏 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelText}>取消</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={handleConfirm}>
            <Text style={styles.confirmText}>确定</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputArea}>
          <BottomSheetTextInput
            value={inputValue}
            onChangeText={setInputValue}
            keyboardType={"numeric"}
            style={styles.textInput}
          />
          <Text style={styles.unitText}>{unit}</Text>
        </View>
        <Text style={styles.tipText}>请确保输入准确的数字。</Text>
      </BottomSheetView>
    </BottomSheet>
  );
});

export default NumberInputSheet;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 20 : 0, // 底部填充
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  keyboardAvoidingContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
  },
  cancelText: {
    color: "#666",
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  confirmText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
    width: "100%",
    justifyContent: "center",
  },
  textInput: {
    height: 60,
    fontSize: 48,
    fontWeight: "bold",
    color: "#333",
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
    textAlign: "center",
    minWidth: "40%",
    paddingHorizontal: 10,
  },
  unitText: {
    fontSize: 24,
    color: "#666",
    marginLeft: 10,
  },
  tipText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});
