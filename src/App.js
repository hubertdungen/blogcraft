import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './styles/app.css';
import './styles/feedback.css';

// Importar componentes
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PostEditor from './components/PostEditor';
import TemplatesManager from './components/TemplatesManager';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import Feedback from './components/Feedback';
import AuthService from './services/AuthService';

// Componente para verificação de autenticação
function RequireAuth({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        const token = AuthService.getAuthToken();
        
        if (!token) {
          throw new Error('No token');
        }
        
        // Verificamos primeiro a validade do token localmente (sem API)
        const tokenData = AuthService.decodeToken(token);
        if (!tokenData) {
          throw new Error('Invalid token format');
        }
        
        // Verificamos se o token está expirado
        if (AuthService.isTokenExpired()) {
          throw new Error('Token expired');
        }
        
        // Token parece válido localmente, permitimos o acesso
        if (isMounted) {
          setIsAuthenticated(true);
          setLoading(false);
        }
        
        // Fazemos uma validação com a API em segundo plano
        try {
          const isValid = await AuthService.validateToken();
          if (!isValid && isMounted) {
            console.warn('Token não validado pela API do Blogger');
            // Não deslogamos imediatamente para evitar ciclos, apenas registramos o problema
          }
        } catch (apiError) {
          console.error('Erro na validação de API:', apiError);
        }
      } catch (error) {
        console.error('Erro de autenticação:', error);
        
        // Limpar token inválido
        AuthService.removeAuthToken();
        
        if (isMounted) {
          setIsAuthenticated(false);
          setError(error.message);
          setLoading(false);
          
          // Redirecionar para login após um breve delay para evitar ciclos
          setTimeout(() => {
            if (location.pathname !== '/') {
              navigate('/', { state: { from: location }, replace: true });
            }
          }, 100);
        }
      }
    };
    
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, [location, navigate]);
  
  if (loading) {
    return <div className="auth-loading">Verificando autenticação...</div>;
  }
  
  if (!isAuthenticated) {
    // Mostrar mensagem de erro se houver
    return (
      <div className="auth-error">
        {error && <Feedback type="error" message={`Erro de autenticação: ${error}`} />}
        <Navigate to="/" state={{ from: location }} replace />
      </div>
    );
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