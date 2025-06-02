import React from 'react';
import { useForm } from '../../hooks';
import { Button, FormInput, Alert } from '../common';
import { validateRegistrationForm } from '../../utils/validation';
import { useAuth } from '../../context/AuthContext';
import './Register.css';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const initialValues: RegisterFormData = {
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
};

/**
 * Registration component with form validation
 */
const Register: React.FC = () => {
  const { register, isLoading, error: authError } = useAuth();
  
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm
  } = useForm<RegisterFormData>({
    initialValues,
    validate: validateRegistrationForm,
    onSubmit: async (data) => {
      await register(data.email, data.password, data.name);
    },
    validateOnBlur: true
  });

  return (
    <div className="register-container">
      <div className="register-form-container">
        <h1>Create Your Account</h1>
        <p className="register-subtitle">Join 安全檢查表 to start your health journey</p>
        
        {authError && <Alert type="error" message={authError} />}
        
        <form onSubmit={handleSubmit} className="register-form">
          <FormInput
            label="Full Name"
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name && errors?.name ? errors.name : undefined}
            placeholder="Enter your full name"
            required
          />
          
          <FormInput
            label="Email Address"
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email && errors?.email ? errors.email : undefined}
            placeholder="Enter your email address"
            required
          />
          
          <FormInput
            label="Password"
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password && errors?.password ? errors.password : undefined}
            placeholder="Create a password"
            required
          />
          
          <FormInput
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.confirmPassword && errors?.confirmPassword ? errors.confirmPassword : undefined}
            placeholder="Confirm your password"
            required
          />
          
          <div className="register-actions">
            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              disabled={isSubmitting || isLoading}
              isLoading={isSubmitting || isLoading}
            >
              Create Account
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              fullWidth 
              onClick={resetForm}
              disabled={isSubmitting || isLoading}
            >
              Reset Form
            </Button>
          </div>
          
          <div className="register-login-link">
            Already have an account? <a href="#login">Log in</a>
          </div>
        </form>
      </div>
      
      <div className="register-info-container">
        <div className="register-info-content">
          <h2>Benefits of Joining</h2>
          <ul className="register-benefits">
            <li>Personalized nutrition tracking</li>
            <li>Custom meal planning</li>
            <li>Progress tracking and analytics</li>
            <li>Community support and resources</li>
            <li>Expert advice and guidance</li>
          </ul>
          
          <div className="register-testimonial">
            <blockquote>
              "安全檢查表 helped me achieve my health goals with personalized tracking and support."
            </blockquote>
            <cite>— Sarah M., Member since 2024</cite>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
