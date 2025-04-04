import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PostEditor from './components/PostEditor';
import TemplatesManager from './components/TemplatesManager';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import AuthService from './services/AuthService';

// Import all necessary styles
import './styles/app.css';
import './styles/dashboard.css';
import './styles/editor.css';
import './styles/templates.css';
import './styles/settings.css';
import './styles/feedback.css';

// Protected route component to handle authentication
const ProtectedRoute = ({ children }) => {
  const token = AuthService.getAuthToken();
  const isAuthenticated = token && !AuthService.isTokenExpired();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Layout component for authenticated pages
const AuthenticatedLayout = ({ children, theme, toggleTheme }) => {
  return (
    <div className="dashboard-container">
      <Sidebar theme={theme} toggleTheme={toggleTheme} />
      {children}
    </div>
  );
};

// Main App component
function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'dark'; // Default to dark theme
  });

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <BrowserRouter>
      <div className={`app-container ${theme}`}>
        <Routes>
          {/* Public route - Login */}
          <Route path="/" element={<Login />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout theme={theme} toggleTheme={toggleTheme}>
                  <Dashboard />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/editor" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout theme={theme} toggleTheme={toggleTheme}>
                  <PostEditor theme={theme} toggleTheme={toggleTheme} />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/editor/:postId" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout theme={theme} toggleTheme={toggleTheme}>
                  <PostEditor theme={theme} toggleTheme={toggleTheme} />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/templates" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout theme={theme} toggleTheme={toggleTheme}>
                  <TemplatesManager theme={theme} />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout theme={theme} toggleTheme={toggleTheme}>
                  <Settings theme={theme} toggleTheme={toggleTheme} />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;