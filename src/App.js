import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './styles/app.css';
import './styles/feedback.css';

// Importar componentes
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PostEditor from './components/PostEditor';
import TemplatesManager from './components/TemplatesManager';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import AuthDebug from './components/AuthDebug';
import AuthService from './services/AuthService';

// Componente para verificação de autenticação
function RequireAuth({ children }) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = AuthService.getAuthToken();
        
        if (!token) {
          throw new Error('Não autenticado');
        }
        
        // Verificar localmente se o token não parece expirado
        if (AuthService.isTokenExpired()) {
          throw new Error('Token expirado');
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erro de autenticação:', error);
        
        // Limpar token inválido
        AuthService.removeAuthToken();
        
        setIsAuthenticated(false);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  if (loading) {
    return <div className="auth-loading">Verificando autenticação...</div>;
  }
  
  if (!isAuthenticated) {
    // Redirecionar para login preservando a URL de destino e informação de erro
    return <Navigate to="/" state={{ from: location, authError: error }} replace />;
  }
  
  return children;
}

// Componente principal do App
function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'dark';
  });

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Router>
      <div className={`app-container ${theme}`}>
        <Routes>
          {/* Rota de Login */}
          <Route path="/" element={<Login />} />
          
          {/* Rota de Depuração (acessível sem autenticação para ajudar em problemas de login) */}
          <Route path="/auth-debug" element={<AuthDebug />} />
          
          {/* Rotas Protegidas */}
          <Route 
            path="/dashboard" 
            element={
              <RequireAuth>
                <div className="dashboard-container">
                  <Sidebar theme={theme} toggleTheme={toggleTheme} />
                  <Dashboard theme={theme} toggleTheme={toggleTheme} />
                </div>
              </RequireAuth>
            } 
          />
          
          <Route 
            path="/editor" 
            element={
              <RequireAuth>
                <div className="editor-container">
                  <Sidebar theme={theme} toggleTheme={toggleTheme} />
                  <PostEditor theme={theme} toggleTheme={toggleTheme} />
                </div>
              </RequireAuth>
            } 
          />
          
          <Route 
            path="/editor/:postId" 
            element={
              <RequireAuth>
                <div className="editor-container">
                  <Sidebar theme={theme} toggleTheme={toggleTheme} />
                  <PostEditor theme={theme} toggleTheme={toggleTheme} />
                </div>
              </RequireAuth>
            } 
          />
          
          <Route 
            path="/templates" 
            element={
              <RequireAuth>
                <div className="templates-container">
                  <Sidebar theme={theme} toggleTheme={toggleTheme} />
                  <TemplatesManager theme={theme} toggleTheme={toggleTheme} />
                </div>
              </RequireAuth>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <RequireAuth>
                <div className="settings-container">
                  <Sidebar theme={theme} toggleTheme={toggleTheme} />
                  <Settings theme={theme} toggleTheme={toggleTheme} />
                </div>
              </RequireAuth>
            } 
          />
          
          {/* Rota de fallback para qualquer outra URL */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;