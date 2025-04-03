import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

/**
 * Componente Sidebar - Barra lateral de navegação
 * 
 * Contém a navegação principal da aplicação, além de
 * controles para alternar o tema e fazer logout.
 */
function Sidebar({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  /**
   * Verifica se o link está ativo
   */
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };
  
  /**
   * Realiza o logout
   */
  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair? Seus dados locais serão mantidos.')) {
      localStorage.removeItem('blogcraft_token');
      navigate('/');
    }
  };
  
  return (
    <div className="sidebar">
      <div className="logo">
        <h2>BlogCraft</h2>
      </div>
      
      <nav className="nav-menu">
        <Link 
          to="/dashboard" 
          className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
        >
          Dashboard
        </Link>
        
        <Link 
          to="/editor" 
          className={`nav-item ${isActive('/editor') ? 'active' : ''}`}
        >
          Novo Post
        </Link>
        
        <Link 
          to="/templates" 
          className={`nav-item ${isActive('/templates') ? 'active' : ''}`}
        >
          Templates
        </Link>
        
        <Link 
          to="/settings" 
          className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
        >
          Configurações
        </Link>
      </nav>
      
      <div className="theme-switch">
        <button onClick={toggleTheme}>
          {theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
        </button>
      </div>
      
      <div className="logout">
        <button onClick={handleLogout}>
          Sair
        </button>
      </div>
    </div>
  );
}

export default Sidebar;