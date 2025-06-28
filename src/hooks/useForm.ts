import { useState, ChangeEvent, FormEvent } from 'react';

type FormInputElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

interface UseFormProps<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>> | null;
  onSubmit: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>> | null;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  handleChange: (e: ChangeEvent<FormInputElement>) => void;
  handleBlur: (e: ChangeEvent<FormInputElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  setFieldValue: (name: keyof T, value: any) => void;
  setFieldTouched: (name: keyof T, isTouched?: boolean) => void;
  setFieldError: (name: keyof T, error: string | null) => void;
  validateField: (name: keyof T) => string | null;
  validateForm: () => Partial<Record<keyof T, string>> | null;
  resetForm: () => void;
}

/**
 * Custom hook for handling form state and validation
 */
function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormProps<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>> | null>(null);
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /**
   * Validates a specific field
   */
  const validateField = (name: keyof T): string | null => {
    if (!validate) return null;
    
    const validationErrors = validate(values);
    // Ensure we handle the case where validationErrors[name] could be undefined
    return validationErrors && name in validationErrors ? validationErrors[name] || null : null;
  };

  /**
   * Validates the entire form
   */
  const validateForm = (): Partial<Record<keyof T, string>> | null => {
    if (!validate) return null;
    return validate(values);
  };

  /**
   * Handles input change events
   */
  const handleChange = (e: ChangeEvent<FormInputElement>): void => {
    const { name, value, type } = e.target;
    const fieldName = name as keyof T;
    let fieldValue: any = value;
    
    // Handle different input types
    if (type === 'checkbox' && 'checked' in e.target) {
      fieldValue = e.target.checked;
    } else if ((type === 'number' || type === 'range') && e.target instanceof HTMLInputElement) {
      fieldValue = e.target.valueAsNumber || '';
    } else if (type === 'date' && e.target instanceof HTMLInputElement) {
      fieldValue = e.target.valueAsDate;
    }
    
    setValues(prev => ({
      ...prev,
      [fieldName]: fieldValue,
    }));
    
    // Set field as touched
    if (!touched[fieldName]) {
      setTouched(prev => ({
        ...prev,
        [fieldName]: true,
      }));
    }
    
    // Validate on change if enabled
    if (validateOnChange) {
      const fieldError = validateField(fieldName);
      setFieldError(fieldName, fieldError);
    } else if (errors && errors[fieldName]) {
      // Clear error for this field if it exists
      setErrors(prev => {
        if (!prev) return null;
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return Object.keys(newErrors).length ? newErrors : null;
      });
    }
  };

  /**
   * Handles input blur events
   */
  const handleBlur = (e: ChangeEvent<FormInputElement>): void => {
    const { name } = e.target;
    const fieldName = name as keyof T;
    
    // Set field as touched
    setTouched(prev => ({
      ...prev,
      [fieldName]: true,
    }));
    
    // Validate on blur if enabled
    if (validateOnBlur) {
      const fieldError = validateField(fieldName);
      setFieldError(fieldName, fieldError);
    }
  };

  /**
   * Sets a field's value programmatically
   */
  const setFieldValue = (name: keyof T, value: any): void => {
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Validate if needed
    if (validateOnChange && touched[name]) {
      const fieldError = validateField(name);
      setFieldError(name, fieldError);
    }
  };

  /**
   * Sets a field's touched state
   */
  const setFieldTouched = (name: keyof T, isTouched = true): void => {
    setTouched(prev => ({
      ...prev,
      [name]: isTouched,
    }));
    
    // Validate if needed
    if (validateOnBlur && isTouched) {
      const fieldError = validateField(name);
      setFieldError(name, fieldError);
    }
  };

  /**
   * Sets a field's error state
   */
  const setFieldError = (name: keyof T, error: string | null): void => {
    if (error) {
      setErrors(prev => {
        // Create a properly typed new errors object
        const newErrors = prev ? { ...prev } : {} as Partial<Record<keyof T, string>>;
        newErrors[name] = error;
        return newErrors;
      });
    } else if (errors && errors[name]) {
      setErrors(prev => {
        if (!prev) return null;
        const newErrors = { ...prev };
        delete newErrors[name];
        return Object.keys(newErrors).length ? newErrors : null;
      });
    }
  };

  /**
   * Resets the form to its initial state
   */
  const resetForm = (): void => {
    setValues(initialValues);
    setErrors(null);
    setTouched({});
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched as Partial<Record<keyof T, boolean>>);
    
    // Validate if validation function is provided
    if (validate) {
      const validationErrors = validate(values);
      if (validationErrors) {
        setErrors(validationErrors);
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    validateField,
    validateForm,
    resetForm,
  };
}

export default useForm;
