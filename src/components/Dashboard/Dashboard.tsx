import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common';
import { FoundationStageForm } from '../InspectionForms';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeForm, setActiveForm] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
  };
  
  const handleBackToDashboard = () => {
    setActiveForm(null);
  };

  // Render active form or dashboard
  if (activeForm === 'foundation') {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>基礎階段巡檢表單</h1>
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
        <FoundationStageForm />
      </div>
    );
  }
  
  // Default dashboard view
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>安全檢查表 Dashboard</h1>
        <Button 
          variant="outline" 
          size="small" 
          onClick={handleLogout}
        >
          登出
        </Button>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-welcome">
          <h2>歡迎, {user?.name || user?.email}</h2>
          <p>自動化表單列表</p>
        </div>

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>基礎階段</h3>
            <p>基礎階段巡檢表單</p>
            <Button 
              variant="primary" 
              size="small"
              onClick={() => setActiveForm('foundation')}
            >
              開始填寫
            </Button>
          </div>

          <div className="dashboard-card">
            <h3>結構階段</h3>
            <p>結構階段巡檢表單</p>
            <Button 
              variant="primary" 
              size="small"
              onClick={() => alert('此功能尚未實現')}
            >
              開始填寫
            </Button>
          </div>

          <div className="dashboard-card">
            <h3>裝修階段</h3>
            <p>裝修階段巡檢表單</p>
            <Button 
              variant="primary" 
              size="small"
              onClick={() => alert('此功能尚未實現')}
            >
              開始填寫
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
