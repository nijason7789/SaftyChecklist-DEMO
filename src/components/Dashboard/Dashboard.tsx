import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };
  
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
            <Link to="/inspection/foundation">
              <Button 
                variant="primary" 
                size="small"
              >
                開始填寫
              </Button>
            </Link>
          </div>

          <div className="dashboard-card">
            <h3>結構階段</h3>
            <p>結構階段巡檢表單</p>
            <Link to="/inspection/structure">
              <Button 
                variant="primary" 
                size="small"
              >
                開始填寫
              </Button>
            </Link>
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
