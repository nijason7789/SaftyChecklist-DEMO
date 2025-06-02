import React from 'react';
import { Button } from '../../../common';

interface FormActionsProps {
  onSubmit: () => void;
  onPrint: () => void;
  isSubmitting: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
  onSubmit,
  onPrint,
  isSubmitting
}) => {
  return (
    <div className="form-actions">
      <Button
        type="button"
        variant="secondary"
        onClick={onPrint}
        disabled={isSubmitting}
      >
        列印表單
      </Button>
      <Button
        type="submit"
        variant="primary"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? '提交中...' : '提交表單'}
      </Button>
    </div>
  );
};

export default FormActions;
