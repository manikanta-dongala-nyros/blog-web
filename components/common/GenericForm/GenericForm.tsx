import React, { useState } from "react";
import { FormConfig } from "./types";
import GenericFormField from "./GenericFormField";

interface GenericFormProps extends FormConfig {
  initialValues?: Record<string, any>;
  errors?: Record<string, string>;
}

const GenericForm: React.FC<GenericFormProps> = ({
  fields,
  onSubmit,
  onCancel,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  className,
  initialValues = {},
  errors = {},
}) => {
  const [formValues, setFormValues] = useState(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formValues);
  };

  const handleFieldChange = (name: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {fields.map((field) => (
        <GenericFormField
          key={field.name}
          {...field}
          value={formValues[field.name] || field.defaultValue || ""}
          onChange={(value) => handleFieldChange(field.name, value)}
          error={errors[field.name]}
        />
      ))}

      <div className="flex justify-end space-x-4 mt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default GenericForm;
