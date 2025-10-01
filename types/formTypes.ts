import React from "react";
import {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  UseFormStateReturn,
} from "react-hook-form";

export type FormColumnsType = FormColumnType[];
export type FormColumnType = {
  label: string;
  prop: string;
  component?: (props: {
    field: ControllerRenderProps<FieldValues, string>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<any>;
  }) => React.ReactElement;
};
