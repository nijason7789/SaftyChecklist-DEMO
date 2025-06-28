import React, { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { Register } from './components';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ErrorBoundary } from './components/common';
import FoundationStagePage from './pages/InspectionForms/FoundationStage';
import StructureStagePage from './pages/InspectionForms/StructureStage';

// Theme toggle component
const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button 
      className={`theme-toggle ${theme}`} 
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

// Main content component that conditionally renders based on auth state
const MainContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  
  // Show loading indicator while checking auth state
  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }
  
  // Toggle between login and register forms
  const toggleAuthForm = () => {
    setShowRegister(prev => !prev);
  };
  
  // Render Routes if authenticated, otherwise render Login or Register
  return (
    <>
      <ThemeToggle />
      {isAuthenticated ? (
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inspection/foundation" element={<FoundationStagePage />} />
          <Route path="/inspection/structure" element={<StructureStagePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        <div className="auth-container">
          {showRegister ? (
            <>
              <Register />
              <p className="auth-toggle-text">
                Already have an account? <button onClick={toggleAuthForm} className="auth-toggle-button">Log in</button>
              </p>
            </>
          ) : (
            <>
              <Login />
              <p className="auth-toggle-text">
                Don't have an account? <button onClick={toggleAuthForm} className="auth-toggle-button">Register</button>
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="App">
              <MainContent />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
