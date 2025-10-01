import {
  View,
  StyleSheet,
  ViewStyle,
  TextInput,
  useColorScheme,
} from "react-native";
import { FormColumnsType } from "@/types/formTypes";
import { ThemedText } from "@/components/ThemedText";
import { Control, Controller, FieldValues, FormState } from "react-hook-form";
import { COLORS } from "@/styles/theme";

type FormProps = {
  columns: FormColumnsType;
  control: Control;
  style?: ViewStyle;
  formState?: FormState<FieldValues>;
  labelWidth?: number;
  inline?: boolean;
};
export default function Form({
  columns,
  control,
  labelWidth = 80,
  inline = true,
}: FormProps) {
  const theme = useColorScheme();
  function getFormChildren() {
    return columns.map((col) => (
      <View
        style={[styles.field, inline && styles.inline]}
        key={col.prop}
      >
        <ThemedText style={{ width: labelWidth }}>{col.label}: </ThemedText>
        <Controller
          name={col.prop}
          control={control}
          render={({ field, formState, fieldState }) => (
            <View style={styles.control}>
              {col.component ? (
                col.component({ field, formState, fieldState })
              ) : (
                <TextInput
                  style={[
                    styles.input,
                    {
                      color:
                        theme === "light" ? COLORS.black : COLORS.infoColor,
                    },
                  ]}
                  value={field.value || ""}
                  onChangeText={field.onChange}
                />
              )}
            </View>
          )}
        />
      </View>
    ));
  }
  return <View style={[styles.form]}>{getFormChildren()}</View>;
}

const styles = StyleSheet.create({
  form: {},
  field: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    margin: 10,
  },
  inline: {
    flexDirection: "row",
    alignItems: "center",
  },
  control: {
    flex: 1,
    width: "100%",
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginHorizontal: 20
  },
});
