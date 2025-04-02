import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import './App.css';

// Importar componentes
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PostEditor from './components/PostEditor';
import TemplatesManager from './components/TemplatesManager';
import Settings from './components/Settings';
import BloggerService from './services/BloggerService';

// Componente de Login
function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      // Armazenar o token
      localStorage.setItem('blogcraft_token', credentialResponse.credential);
      
      // Verificar se o token é válido para a API do Blogger
      const isValid = await BloggerService.validateToken();
      
      if (!isValid) {
        throw new Error('Token inválido para a API do Blogger');
      }
      
      // Redirecionar para o dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro na autenticação:', error);
      setError(`Falha na autenticação: ${error.message}`);
      localStorage.removeItem('blogcraft_token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>BlogCraft</h1>
        <p>Editor Avançado para Blogger</p>
        
        <div className="login-form">
          {loading ? (
            <div className="loading">Autenticando...</div>
          ) : (
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={() => setError('Falha na autenticação com o Google')}
              useOneTap={false}
              text="continue_with"
              theme="filled_blue"
              width="280"
              logo_alignment="center"
              shape="pill"
              context="signin"
            />
          )}
          
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </div>
  );
}

// Componente para verificação de autenticação
function RequireAuth({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('blogcraft_token');
        
        if (!token) {
          throw new Error('No token');
        }
        
        // Verificar se o token é válido
        const isValid = await BloggerService.validateToken();
        
        if (!isValid) {
          throw new Error('Invalid token');
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erro de autenticação:', error);
        // Limpar token inválido
        localStorage.removeItem('blogcraft_token');
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

  return (
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
                <Dashboard theme={theme} toggleTheme={toggleTheme} />
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
  );
}

export default App;