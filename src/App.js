import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './styles/app.css';

// Importar componentes
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PostEditor from './components/PostEditor';
import TemplatesManager from './components/TemplatesManager';
import Settings from './components/Settings';
import AuthService from './services/AuthService';

// Componente para verificação de autenticação
function RequireAuth({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = AuthService.getAuthToken();
        
        if (!token) {
          throw new Error('No token');
        }
        
        // Verificar se o token é válido
        const isValid = await AuthService.validateToken();
        
        if (!isValid) {
          throw new Error('Invalid token');
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erro de autenticação:', error);
        // Limpar token inválido
        AuthService.removeAuthToken();
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate, location]);
  
  if (loading) {
    return <div className="auth-loading">Verificando autenticação...</div>;
  }
  
  if (!isAuthenticated) {
    // Redirecionar para login preservando a URL de destino
    return <Navigate to="/" state={{ from: location }} replace />;
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

  // Obter Client ID do .env ou usar um valor padrão
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || 
                   "404858006833-cs2qa9oank867t1jkpttus0uq1m7nnfm.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <div className={`app-container ${theme}`}>
          <Routes>
            {/* Rota de Login */}
            <Route path="/" element={<Login />} />
            
            {/* Rotas Protegidas */}
            <Route 
              path="/dashboard" 
              element={
                <RequireAuth>
                  <div className="layout-with-sidebar">
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
                  <div className="layout-with-sidebar">
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
                  <div className="layout-with-sidebar">
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
                  <div className="layout-with-sidebar">
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
                  <div className="layout-with-sidebar">
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
    </GoogleOAuthProvider>
  );
}

export default App;