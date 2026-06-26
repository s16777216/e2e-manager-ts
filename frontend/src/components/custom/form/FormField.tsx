import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import React, { useContext } from "react";
import {
  type FieldValues,
  type ControllerRenderProps,
  Controller,
} from "react-hook-form";
import { FormContext } from "./FormContext";

export interface FormFieldProps {
  name: string;
  label: string;
  description?: string | React.ReactNode;
  children?:
    | React.ReactElement
    | ((
        field: ControllerRenderProps<FieldValues, string>,
        id: string,
      ) => React.ReactNode);
}

function FormField(props: FormFieldProps) {
  const { name, label, description, children } = props;
  const form = useContext(FormContext);

  if (!form) {
    throw new Error("FormField must be used within FormBlock");
  }

  const id = `form-field-${name}`;

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          {children &&
            (React.isValidElement(children)
              ? React.cloneElement(children, {
                  ...field,
                  id,
                } as Partial<unknown>)
              : children(field, id))}
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export default FormField;
