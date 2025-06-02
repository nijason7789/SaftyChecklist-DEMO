import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  fullWidth?: boolean;
}

/**
 * Reusable Button component with different variants and sizes
 */
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}) => {
  const baseClass = 'button';
  const variantClass = `${baseClass}--${variant}`;
  const sizeClass = `${baseClass}--${size}`;
  const loadingClass = isLoading ? `${baseClass}--loading` : '';
  const widthClass = fullWidth ? `${baseClass}--full-width` : '';
  
  const combinedClassName = `${baseClass} ${variantClass} ${sizeClass} ${loadingClass} ${widthClass} ${className}`.trim();
  
  return (
    <button
      className={combinedClassName}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="button__loading-indicator">Loading...</span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
