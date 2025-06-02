import React from 'react';
import './Alert.css';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  message: string;
  className?: string;
  onClose?: () => void;
}

/**
 * Alert component for displaying messages with different severity levels
 */
const Alert: React.FC<AlertProps> = ({
  type,
  message,
  className = '',
  onClose,
}) => {
  const baseClass = 'alert';
  const typeClass = `${baseClass}--${type}`;
  
  return (
    <div className={`${baseClass} ${typeClass} ${className}`}>
      <div className="alert__content">
        <span className="alert__message">{message}</span>
      </div>
      {onClose && (
        <button 
          type="button" 
          className="alert__close-button"
          onClick={onClose}
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
