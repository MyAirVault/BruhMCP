import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable form field component with consistent styling
 * Handles label, required indicator, and field wrapper
 */
const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  required = false, 
  children, 
  className = '' 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
};

export default FormField;