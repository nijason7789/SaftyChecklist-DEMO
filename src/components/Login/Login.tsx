import React, { useState, useEffect } from 'react';
import './Login.css';
import useForm from '../../hooks/useForm';
import { validateLoginForm } from '../../utils/validation';
import { Button, FormInput, Alert } from '../../components/common';
import { useAuth } from '../../context/AuthContext';

// Define types for form data
interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  // State for success message
  const [success, setSuccess] = useState<string>('');
  
  // Use auth context
  const { login, isAuthenticated, isLoading: authLoading, error: authError } = useAuth();
  
  // Handle form submission
  const handleLoginSubmit = async (values: LoginFormData): Promise<void> => {
    try {
      // Use the login function from auth context
      await login(values.email, values.password);
      
      // If login is successful
      setSuccess('Login successful! Redirecting...');
      
      // In a real application, you would redirect the user here
      console.log('Login submitted with:', values);
      
    } catch (err) {
      // The error will be handled by the auth context
      console.error('Login error:', err);
    }
  };
  
  // Use our custom form hook
  const { 
    values, 
    errors, 
    isSubmitting, 
    handleChange, 
    handleSubmit 
  } = useForm<LoginFormData>({
    initialValues: { email: '', password: '' },
    validate: validateLoginForm,
    onSubmit: handleLoginSubmit
  });
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // In a real app, you would redirect to a dashboard or home page
      console.log('User is already authenticated, should redirect');
    }
  }, [isAuthenticated]);
  
  // Get form error message for display
  const getErrorMessage = (): string | null => {
    if (authError) return authError;
    if (!errors) return null;
    return Object.values(errors)[0] || null;
  };
  
  const errorMessage = getErrorMessage();
  
  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h1 className="login-title">Welcome to 安全檢查表</h1>
        <p className="login-subtitle">Sign in to your account</p>
        
        {errorMessage && <Alert type="error" message={errorMessage} />}
        {success && <Alert type="success" message={success} />}
        
        <form className="login-form" onSubmit={handleSubmit}>
          <FormInput
            label="Email"
            type="email"
            id="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            placeholder="Enter your email"
            disabled={isSubmitting || authLoading}
            autoComplete="email"
            error={errors?.email}
          />
          
          <FormInput
            label="Password"
            type="password"
            id="password"
            name="password"
            value={values.password}
            onChange={handleChange}
            placeholder="Enter your password"
            disabled={isSubmitting || authLoading}
            autoComplete="current-password"
            error={errors?.password}
          />
          
          <Button 
            type="submit" 
            variant="primary"
            size="medium"
            className="login-button"
            disabled={isSubmitting || authLoading}
            isLoading={isSubmitting || authLoading}
          >
            Sign In
          </Button>
        </form>
        
        <div className="login-footer">
          <p>Don't have an account? <a href="#signup">Sign up</a></p>
          <p><a href="#forgot-password">Forgot password?</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
