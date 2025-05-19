export type FieldType = 'text' | 'textarea' | 'number' | 'email' | 'password' | 'select' | 'checkbox' | 'radio' | 'date' | 'file';

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: { label: string; value: string | number }[];
  defaultValue?: any;
  required?: boolean;
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