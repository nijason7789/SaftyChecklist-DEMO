import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/common';
import { StructureStageForm } from '../../../components/InspectionForms';
import { useAuth } from '../../../context/AuthContext';

const StructureStagePage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };
  
  const handleBackToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>結構階段巡檢表單</h1>
        <div className="header-actions">
          <Button 
            variant="outline" 
            size="small" 
            onClick={handleBackToDashboard}
            style={{ marginRight: '10px' }}
          >
            返回列表
          </Button>
          <Button 
            variant="outline" 
            size="small" 
            onClick={handleLogout}
          >
            登出
          </Button>
        </div>
      </header>
      <StructureStageForm />
    </div>
  );
};

export default StructureStagePage;
