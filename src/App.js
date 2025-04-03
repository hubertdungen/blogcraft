import React, { useState, useEffect, useRef } from 'react';
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
import LoginDebugger from './components/LoginDebugger';
import TokenManager from './services/TokenManager'; // Adicionar esta importação

// Componente para verificação de autenticação
function RequireAuth({ children }) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  
  // Usar useRef para controlar se já fizemos a verificação
  const authCheckRef = useRef(false);
  
  useEffect(() => {
    // Se já verificamos, não verificar novamente
    if (authCheckRef.current) {
      return;
    }
    
    const checkAuth = async () => {
      try {
        authCheckRef.current = true;
        
        console.log('Verificando autenticação...');
        const token = AuthService.getAuthToken();
        
        if (!token) {
          console.log('Nenhum token encontrado');
          throw new Error('Não autenticado');
        }
        
        console.log('Token encontrado, tentando decodificar...');
        const decodedToken = AuthService.decodeToken(token);
        console.log('Token decodificado:', decodedToken ? 'Sim' : 'Não');
        
        if (decodedToken) {
          console.log('Token info:', JSON.stringify({
            sub: decodedToken?.sub,
            exp: decodedToken?.exp,
            iat: decodedToken?.iat
          }));
        }
        
        // Usar validação mais flexível para o primeiro acesso após login
        // Para evitar que o token seja removido imediatamente após ser salvo
        const isFirstValidation = sessionStorage.getItem('first_validation') !== 'done';
        
        let isValid;
        if (isFirstValidation) {
          console.log('Primeira validação após login - usando validação básica');
          isValid = TokenManager.validateToken(false); // Modo não estrito
          if (isValid) {
            sessionStorage.setItem('first_validation', 'done');
          }
        } else {
          console.log('Validação subsequente - usando validação completa');
          isValid = TokenManager.validateToken(true); // Modo estrito
        }
        
        if (!isValid) {
          console.log('Token inválido ou expirado');
          // Usar a fonte para identificar quem está removendo o token
          AuthService.removeAuthToken('RequireAuth-invalidToken');
          throw new Error('Token inválido ou expirado');
        }
        
        // Se chegou aqui, o token é válido
        console.log('Token válido, autenticação bem-sucedida');
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erro de autenticação:', error);
        setIsAuthenticated(false);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Se já estamos autenticados, renderizar os children
  if (isAuthenticated) {
    return children;
  }
  
  if (loading) {
    return <div className="auth-loading">Verificando autenticação...</div>;
  }
  
  // Se não estamos autenticados, redirecionar para login
  return <Navigate to="/" state={{ from: location, authError: error }} replace />;
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

        {/* Adicionar o debugger */}
        {process.env.NODE_ENV !== 'production' && <LoginDebugger />}
      
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