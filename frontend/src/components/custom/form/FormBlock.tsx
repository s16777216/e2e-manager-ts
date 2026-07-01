import { Button } from "src/components/ui/button";
import { useForm, type UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { FormContext } from "./FormContext";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";

export interface FormBlockProps<T extends z.ZodTypeAny> {
  label: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  formSchema?: T;
  defaultValues?: UseFormProps<z.infer<T>>["defaultValues"];
  onSubmit?: (data: z.infer<T>) => void;
  submitText?: string;
  submitIcon?: IconName;
  showSubmitButton?: boolean;
}

const FormBlock = <T extends z.ZodTypeAny>(props: FormBlockProps<T>) => {
  const {
    label,
    description,
    children,
    formSchema = z.object({}),
    defaultValues,
    onSubmit = () => {},
    submitText = "儲存",
    submitIcon = "save",
    showSubmitButton = true,
  } = props;

  type FormDataType = z.infer<typeof formSchema>;

  const form = useForm<FormDataType>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  return (
    <FieldSet className="grid grid-cols-1 gap-10 lg:grid-cols-3">
      {/* Vertical Tabs List */}
      <div className="flex flex-col space-y-1">
        <FieldLegend>{label}</FieldLegend>
        <FieldDescription>{description}</FieldDescription>
      </div>

      {/* Content */}
      <div className="space-y-6 lg:col-span-2">
        <form className="mx-auto" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <FormContext.Provider value={form}>{children}</FormContext.Provider>
            <Field orientation="horizontal" className="flex justify-end">
              {showSubmitButton && (
                <Button type="submit" className="max-sm:w-full">
                  <DynamicIcon name={submitIcon} />
                  {submitText}
                </Button>
              )}
            </Field>
          </FieldGroup>
        </form>
      </div>
    </FieldSet>
  );
};

export default FormBlock;
