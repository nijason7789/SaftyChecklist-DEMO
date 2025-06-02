import React from 'react';
import './FormInput.css';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

/**
 * Reusable form input component with label and error handling
 */
const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const hasError = !!error;
  
  return (
    <div className={`form-input ${hasError ? 'form-input--error' : ''} ${className}`}>
      <label htmlFor={inputId} className="form-input__label">
        {label}
      </label>
      <input
        id={inputId}
        className="form-input__field"
        aria-invalid={hasError}
        {...props}
      />
      {(error || helperText) && (
        <div className={`form-input__message ${hasError ? 'form-input__message--error' : ''}`}>
          {error || helperText}
        </div>
      )}
    </div>
  );
};

export default FormInput;
