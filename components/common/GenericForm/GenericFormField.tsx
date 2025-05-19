// import React from "react";
// import { FormFieldConfig } from "./types";

// interface GenericFormFieldProps extends FormFieldConfig {
//   value: any;
//   onChange: (value: any) => void;
//   error?: string;
// }

// const GenericFormField: React.FC<GenericFormFieldProps> = ({
//   name,
//   label,
//   type,
//   placeholder,
//   options,
//   value,
//   onChange,
//   error,
//   required,
//   disabled,
//   className,
// }) => {
//   const renderField = () => {
//     switch (type) {
//       case "textarea":
//         return (
//           <textarea
//             id={name}
//             name={name}
//             value={value}
//             onChange={(e) => onChange(e.target.value)}
//             placeholder={placeholder}
//             required={required}
//             disabled={disabled}
//             className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${className}`}
//           />
//         );

//       case "select":
//         return (
//           <select
//             id={name}
//             name={name}
//             value={value}
//             onChange={(e) => onChange(e.target.value)}
//             required={required}
//             disabled={disabled}
//             className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${className}`}
//           >
//             {options?.map((option) => (
//               <option key={option.value} value={option.value}>
//                 {option.label}
//               </option>
//             ))}
//           </select>
//         );

//       case "checkbox":
//         return (
//           <input
//             type="checkbox"
//             id={name}
//             name={name}
//             checked={value}
//             onChange={(e) => onChange(e.target.checked)}
//             required={required}
//             disabled={disabled}
//             className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${className}`}
//           />
//         );

//       default:
//         return (
//           <input
//             type={type}
//             id={name}
//             name={name}
//             value={value}
//             onChange={(e) => onChange(e.target.value)}
//             placeholder={placeholder}
//             required={required}
//             disabled={disabled}
//             className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${className}`}
//           />
//         );
//     }
//   };

//   return (
//     <div className="mb-4">
//       <label htmlFor={name} className="block text-sm font-medium text-gray-700">
//         {label}
//         {required && <span className="text-red-500 ml-1">*</span>}
//       </label>
//       {renderField()}
//       {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
//     </div>
//   );
// };

// export default GenericFormField;

import React from "react";
import { FormFieldConfig } from "./types";

interface GenericFormFieldProps extends FormFieldConfig {
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

const GenericFormField: React.FC<GenericFormFieldProps> = ({
  name,
  label,
  type,
  placeholder,
  options,
  value,
  onChange,
  error,
  required,
  disabled,
  className, // Prop for additional custom classes
}) => {
  // Base classes for all input types for consistency
  const baseInputClasses = `
    block w-full px-4 py-2 text-base text-gray-700 bg-white
    border border-gray-300 rounded-lg shadow-sm
    transition duration-300 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${disabled ? "bg-gray-100 cursor-not-allowed opacity-75" : ""}
    ${error ? "border-red-500 focus:ring-red-500" : ""}
    ${className || ""}
  `;

  const renderField = () => {
    switch (type) {
      case "textarea":
        return (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={4} // Default rows for textarea
            className={`${baseInputClasses} resize-y`} // Allow vertical resizing
          />
        );

      case "select":
        return (
          <div className="relative">
            <select
              id={name}
              name={name}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              required={required}
              disabled={disabled}
              className={`${baseInputClasses} appearance-none pr-8`} // Hide default arrow, add padding for custom arrow
            >
              {placeholder && <option value="">{placeholder}</option>}{" "}
              {/* Optional placeholder for select */}
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {/* Custom arrow for select dropdown */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        );

      case "checkbox":
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={name}
              name={name}
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
              required={required}
              disabled={disabled}
              // Custom checkbox styling
              className={`
                h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500
                transition duration-150 ease-in-out
                ${disabled ? "bg-gray-200 cursor-not-allowed" : ""}
                ${className || ""}
              `}
            />
            {/* If there's a separate label for checkbox, it should be outside this div */}
            {/* The primary label will be rendered below renderField() */}
          </div>
        );

      // Handle file input for potential future use (though not currently in your types)
      case "file":
        return (
          <input
            type="file"
            id={name}
            name={name}
            onChange={(e) => onChange(e.target.files?.[0] || null)}
            required={required}
            disabled={disabled}
            className={`${baseInputClasses} file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100 cursor-pointer`}
          />
        );

      default:
        return (
          <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={baseInputClasses}
          />
        );
    }
  };

  return (
    <div className="mb-6">
      {" "}
      {/* Increased bottom margin for better spacing */}
      {label && ( // Only render label if it exists
        <label
          htmlFor={name}
          className="block text-sm font-semibold text-gray-800 mb-2"
        >
          {" "}
          {/* Stronger label */}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {renderField()}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          {" "}
          {/* Improved error message */}
          <svg
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default GenericFormField;
