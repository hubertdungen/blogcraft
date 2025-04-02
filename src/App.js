import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import './App.css';




// Componente de Login
function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  
  const handleLoginSuccess = (credentialResponse) => {
    console.log('Login success:', credentialResponse);
    
    // Armazenar o token
    localStorage.setItem('blogcraft_token', credentialResponse.credential);
    
    // Redirecionar para o dashboard
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>BlogCraft</h1>
        <p>Editor Avançado para Blogger</p>
        
        <div className="login-form">
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => setError('Falha na autenticação')}
            useOneTap={false}
            text="continue_with"
            theme="filled_blue"
          />
          
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </div>
  );
}

// Componente do Dashboard
function Dashboard() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('dark');
  
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };
  
  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      localStorage.removeItem('blogcraft_token');
      navigate('/');
    }
  };
  
  return (
    <div className="dashboard-container">
      <Sidebar theme={theme} toggleTheme={toggleTheme} />
      
      <div className="main-content">
        <h1>Dashboard</h1>
        
        <div className="welcome-message">
          <h2>Bem-vindo ao BlogCraft!</h2>
          <p>Seu editor avançado para o Blogger.</p>
        </div>
        
        <div className="quick-actions">
          <h3>Ações Rápidas</h3>
          <div className="action-buttons">
            <button className="create-button" onClick={() => navigate('/editor')}>
              Criar Novo Post
            </button>
            <button className="template-button" onClick={() => navigate('/templates')}>
              Gerenciar Templates
            </button>
            <button className="settings-button" onClick={() => navigate('/settings')}>
              Configurações
            </button>
          </div>
        </div>
        
        <div className="blogs-section">
          <h3>Seus Blogs</h3>
          <p>Carregando blogs...</p>
        </div>
      </div>
    </div>
  );
}

// Componente da Barra Lateral
function Sidebar({ theme, toggleTheme }) {
  return (
    <div className="sidebar">
      <div className="logo">
        <h2>BlogCraft</h2>
      </div>
      
      <nav className="nav-menu">
        <Link to="/dashboard" className="nav-item active">
          Dashboard
        </Link>
        <Link to="/editor" className="nav-item">
          Novo Post
        </Link>
        <Link to="/templates" className="nav-item">
          Templates
        </Link>
        <Link to="/settings" className="nav-item">
          Configurações
        </Link>
      </nav>
      
      <div className="theme-switch">
        <button onClick={toggleTheme}>
          {theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
        </button>
      </div>
      
      <div className="logout">
        <button onClick={() => {
          if (window.confirm('Tem certeza que deseja sair?')) {
            localStorage.removeItem('blogcraft_token');
            window.location.href = '/';
          }
        }}>
          Sair
        </button>
      </div>
    </div>
  );
}

// Verificação de Autenticação
function RequireAuth({ children }) {
  const token = localStorage.getItem('blogcraft_token');
  
  if (!token) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        } />
        <Route path="/editor" element={
          <RequireAuth>
            <div className="placeholder-page">
              <Sidebar theme="dark" toggleTheme={() => {}} />
              <div className="main-content">
                <h1>Editor</h1>
                <p>Página do Editor - Em construção</p>
                <Link to="/dashboard">Voltar para o Dashboard</Link>
              </div>
            </div>
          </RequireAuth>
        } />
        <Route path="/templates" element={
          <RequireAuth>
            <div className="placeholder-page">
              <Sidebar theme="dark" toggleTheme={() => {}} />
              <div className="main-content">
                <h1>Templates</h1>
                <p>Página de Templates - Em construção</p>
                <Link to="/dashboard">Voltar para o Dashboard</Link>
              </div>
            </div>
          </RequireAuth>
        } />
        <Route path="/settings" element={
          <RequireAuth>
            <div className="placeholder-page">
              <Sidebar theme="dark" toggleTheme={() => {}} />
              <div className="main-content">
                <h1>Configurações</h1>
                <p>Página de Configurações - Em construção</p>
                <Link to="/dashboard">Voltar para o Dashboard</Link>
              </div>
            </div>
          </RequireAuth>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;