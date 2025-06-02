/**
 * Validates an email address
 * @param email Email address to validate
 * @returns True if email is valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a password meets minimum requirements
 * @param password Password to validate
 * @param minLength Minimum length (default: 6)
 * @returns True if password meets requirements, false otherwise
 */
export const isValidPassword = (password: string, minLength = 6): boolean => {
  return password.length >= minLength;
};

/**
 * Validates if a password has a strong complexity
 * @param password Password to validate
 * @returns True if password is strong, false otherwise
 */
export const isStrongPassword = (password: string): boolean => {
  // At least 8 characters, one uppercase, one lowercase, one number, one special character
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

/**
 * Validates a name (no numbers or special characters)
 * @param name Name to validate
 * @returns True if name is valid, false otherwise
 */
export const isValidName = (name: string): boolean => {
  const nameRegex = /^[A-Za-z\s'-]+$/;
  return nameRegex.test(name);
};

/**
 * Validates a phone number
 * @param phone Phone number to validate
 * @returns True if phone number is valid, false otherwise
 */
export const isValidPhone = (phone: string): boolean => {
  // Basic phone validation - can be adjusted for specific country formats
  const phoneRegex = /^\+?[\d\s()-]{8,}$/;
  return phoneRegex.test(phone);
};

/**
 * Validates a URL
 * @param url URL to validate
 * @returns True if URL is valid, false otherwise
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates a date is in the past
 * @param date Date to validate
 * @returns True if date is in the past, false otherwise
 */
export const isPastDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * Validates a date is in the future
 * @param date Date to validate
 * @returns True if date is in the future, false otherwise
 */
export const isFutureDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
};

/**
 * Validates login form data
 * @param data Form data containing email and password
 * @returns Object with error messages or null if valid
 */
export const validateLoginForm = (data: { email: string; password: string }) => {
  const errors: { email?: string; password?: string } = {};
  
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(data.password)) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  return Object.keys(errors).length ? errors : null;
};

// Removed duplicate functions

/**
 * Validates registration form data
 * @param data Form data containing name, email, password, and confirmPassword
 * @returns Object with error messages or null if valid
 */
export const validateRegistrationForm = (data: { 
  name: string; 
  email: string; 
  password: string; 
  confirmPassword: string;
 }) => {
  const errors: { 
    name?: string; 
    email?: string; 
    password?: string; 
    confirmPassword?: string;
  } = {};
  
  if (!data.name) {
    errors.name = 'Name is required';
  } else if (!isValidName(data.name)) {
    errors.name = 'Please enter a valid name';
  }
  
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (!isStrongPassword(data.password)) {
    errors.password = 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character';
  }
  
  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  return Object.keys(errors).length ? errors : null;
};

/**
 * Validates profile form data
 * @param data Form data containing name, email, phone, etc.
 * @returns Object with error messages or null if valid
 */
export const validateProfileForm = (data: { 
  name: string; 
  email: string; 
  phone?: string;
  birthDate?: Date;
 }) => {
  const errors: { 
    name?: string; 
    email?: string; 
    phone?: string;
    birthDate?: string;
  } = {};
  
  if (!data.name) {
    errors.name = 'Name is required';
  } else if (!isValidName(data.name)) {
    errors.name = 'Please enter a valid name';
  }
  
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (data.phone && !isValidPhone(data.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }
  
  if (data.birthDate && !isPastDate(data.birthDate)) {
    errors.birthDate = 'Birth date must be in the past';
  }
  
  return Object.keys(errors).length ? errors : null;
};
