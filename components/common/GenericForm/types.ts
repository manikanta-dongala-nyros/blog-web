export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "password"
  | "select"
  | "checkbox"
  | "radio"
  | "date"
  | "file";

export interface FormFieldConfig {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  accept?: string; // <-- Add this line
  options?: { label: string; value: string | number }[];

  disabled?: boolean;
  className?: string;
}

export interface FormConfig {
  fields: FormFieldConfig[];
  onSubmit: (values: any) => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  className?: string;
}
