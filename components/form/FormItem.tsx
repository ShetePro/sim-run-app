import {
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
  Text,
  StyleProp,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import {
  Control,
  Controller,
  FieldValues,
  FormState,
  RegisterOptions,
} from "react-hook-form";
import { FormColumnType } from "@/types/formTypes";
import { FieldErrors } from "react-hook-form/dist/types/errors";
import { COLORS } from "@/styles/theme";
import {useThemeColor} from "@/hooks/useThemeColor";
type FormItemProps = Partial<FormColumnType> & {
  control: Control<any> | undefined;
  prop: string;
  style?: StyleProp<ViewStyle>;
  formState?: FormState<FieldValues>;
  labelWidth?: number;
  inline?: boolean;
  rules?:
    | Omit<
        RegisterOptions<FieldValues, string>,
        "disabled" | "setValueAs" | "valueAsNumber" | "valueAsDate"
      >
    | undefined;
  label?: string;
  errors?: FieldErrors;
};
export default function FormItem({
  label = "",
  prop,
  inline = true,
  control,
  labelWidth,
  style,
  component,
  rules,
  errors,
}: FormItemProps) {
  const colors = useThemeColor()
  const error = errors ? errors[prop]?.message : "";
  return (
    <View style={[styles.field, inline && styles.inline, style]} key={prop}>
      {label && (
        <ThemedText
          numberOfLines={1}
          ellipsizeMode={"tail"}
          style={{ width: labelWidth, height: 30, textAlign: "left" }}
        >
          {label}:{" "}
        </ThemedText>
      )}
      <Controller
        name={prop}
        rules={rules}
        control={control}
        render={({ field, formState, fieldState }) => (
          <View style={styles.control}>
            {component ? (
              component({ field, formState, fieldState })
            ) : (
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                  },
                ]}
                placeholder={"请输入"}
                value={field.value || ""}
                onChangeText={field.onChange}
              />
            )}
          </View>
        )}
      />
      {error && <ThemedText style={styles.error}>{error as string}</ThemedText>}
    </View>
  );
}
const styles = StyleSheet.create({
  field: {
    flexDirection: "column",
    justifyContent: "center",
    marginVertical: 10,
    marginHorizontal: 10,
    flex: 1
  },
  inline: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },
  control: {
    flex: 1,
  },
  input: {
    padding: 5,
    height: 40,
  },
  error: {
    position: "absolute",
    bottom: "-80%",
    left: 0,
    color: COLORS.dangerColor,
  },
});
