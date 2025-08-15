import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../logo.svg';
import i18n, { t } from '../services/I18nService';

/**
 * Componente Sidebar - Barra lateral de navegação
 * 
 * Contém a navegação principal da aplicação, além de
 * controles para alternar o tema e fazer logout.
 */
function Sidebar({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [_locale, setLocale] = useState(i18n.getLocale());

  useEffect(() => {
    const remove = i18n.addListener(setLocale);
    return remove;
  }, []);
  
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
    if (window.confirm(t('auth.confirmLogout'))) {
      localStorage.removeItem('blogcraft_token');
      navigate('/');
    }
  };
  
  return (
    <div className="sidebar">
      <div className="logo">
        <h2>
          <img src={logo} alt="BlogCraft logo" className="logo-icon" />
          BlogCraft
        </h2>
      </div>
      
      <nav className="nav-menu">
        <Link
          to="/dashboard"
          className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
        >
          {t('nav.dashboard')}
        </Link>

        <Link
          to="/editor"
          className={`nav-item ${isActive('/editor') ? 'active' : ''}`}
        >
          {t('nav.editor')}
        </Link>

        <Link
          to="/templates"
          className={`nav-item ${isActive('/templates') ? 'active' : ''}`}
        >
          {t('nav.templates')}
        </Link>

        <Link
          to="/settings"
          className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
        >
          {t('nav.settings')}
        </Link>
      </nav>
      
      <div className="theme-switch">
        <button onClick={toggleTheme}>
          {theme === 'dark'
            ? `☀️ ${t('settings.fields.themeLight')}`
            : `🌙 ${t('settings.fields.themeDark')}`}
        </button>
      </div>

      <div className="logout">
        <button onClick={handleLogout}>
          {t('auth.logout')}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;