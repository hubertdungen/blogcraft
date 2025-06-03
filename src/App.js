import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PostEditor from './components/PostEditor';
import TemplatesManager from './components/TemplatesManager';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import AuthDebugger from './components/AuthDebugger'; // Import the new debugger component
import AuthService from './services/AuthService';
import LoginDebugger from './components/LoginDebugger';

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
  
  // Basic token validation (improved from original)
  const isAuthenticated = token && !AuthService.isTokenExpired();
  
  if (!isAuthenticated) {
    console.warn('[ProtectedRoute] Authentication check failed, redirecting to login');
    return <Navigate to="/" replace state={{ authError: "Authentication required. Please log in." }} />;
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

  // Tracking authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const token = AuthService.getAuthToken();
      const validated = token && !AuthService.isTokenExpired();
      setIsAuthenticated(validated);
    };
    
    // Check immediately
    checkAuth();
    
    // Setup localStorage event listener to detect changes
    const handleStorageChange = (e) => {
      if (e.key === 'blogcraft_token') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  /**
   * Alterna o tema ou define explicitamente um tema
   * @param {('light'|'dark')} [newTheme] - Tema opcional a ser definido
   */
  const toggleTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme);
    } else {
      setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
    }
  };

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <div className={`app-container ${theme}`}>

        {/* Add the debugger here, before Routes */}
        {process.env.NODE_ENV !== 'production' && <LoginDebugger />}
        

        <Routes>
          {/* Public route - Login */}
          <Route path="/" element={<Login />} />
          
          {/* New route for authentication debugging */}
          <Route 
            path="/auth-debug" 
            element={
              <ProtectedRoute>
                <AuthenticatedLayout theme={theme} toggleTheme={toggleTheme}>
                  <AuthDebugger />
                </AuthenticatedLayout>
              </ProtectedRoute>
            } 
          />
          
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