import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BloggerService from '../services/BloggerService';

// Importar o serviço de internacionalização
import i18n, { LOCALES, t } from '../services/I18nService';

/**
 * Componente Settings - Configurações da aplicação
 * 
 * Permite ao utilizador configurar:
 * - Blog padrão
 * - Template padrão
 * - Intervalo de salvamento automático
 * - Backup automático
 * - Preferências visuais
 * - Idioma da interface
 */
function Settings({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [language, setLanguage] = useState(i18n.getLocale());
  const [settings, setSettings] = useState({
    defaultBlogId: '',
    defaultTemplate: '',
    autoSaveInterval: 5,
    autoBackup: true,
    confirmBeforeDelete: true,
    defaultPublishStatus: 'draft'
  });
  const [error, setError] = useState(null);
  
  // Carregar configurações e dados ao montar o componente
  useEffect(() => {
    loadSettings();
    loadBlogs();
    loadTemplates();
  }, []);

  /**
   * Carrega as configurações salvas
   */
  const loadSettings = () => {
    try {
      const savedSettings = JSON.parse(localStorage.getItem('blogcraft_settings') || '{}');
      
      setSettings({
        defaultBlogId: savedSettings.defaultBlogId || '',
        defaultTemplate: savedSettings.defaultTemplate || '',
        autoSaveInterval: savedSettings.autoSaveInterval || 5,
        autoBackup: savedSettings.autoBackup !== undefined ? savedSettings.autoBackup : true,
        confirmBeforeDelete: savedSettings.confirmBeforeDelete !== undefined ? savedSettings.confirmBeforeDelete : true,
        defaultPublishStatus: savedSettings.defaultPublishStatus || 'draft'
      });
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setError(t('settings.confirmations.loadError'));
    }
  };

  /**
   * Carrega os blogs do utilizador
   */
  const loadBlogs = async () => {
    try {
      setLoading(true);
      
      const data = await BloggerService.getUserBlogs();
      
      if (data.items) {
        setBlogs(data.items);
      }
    } catch (error) {
      console.error('Erro ao buscar blogs:', error);
      setError(t('common.error', { message: error.message }));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carrega os templates salvos
   */
  const loadTemplates = () => {
    try {
      const savedTemplates = JSON.parse(localStorage.getItem('blogcraft_templates') || '[]');
      setTemplates(savedTemplates);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      setTemplates([]);
    }
  };

  /**
   * Atualiza uma configuração
   */
  const handleSettingChange = (e, setting) => {
    const value = 
      setting === 'autoBackup' || setting === 'confirmBeforeDelete'
        ? e.target.checked 
        : setting === 'autoSaveInterval'
          ? parseInt(e.target.value, 10)
          : e.target.value;
    
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  /**
   * Manipula a mudança de idioma
   */
  const handleLanguageChange = (e) => {
    const newLocale = e.target.value;
    setLanguage(newLocale);
  };

  /**
   * Salva as configurações
   */
  const handleSaveSettings = () => {
    try {
      // Salvar configurações gerais
      localStorage.setItem('blogcraft_settings', JSON.stringify(settings));
      
      // Salvar idioma
      i18n.setLocale(language);
      
      alert(t('settings.confirmations.saveSuccess'));
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert(t('common.error', { message: error.message }));
    }
  };

  /**
   * Restaura as configurações padrão
   */
  const handleResetSettings = () => {
    if (window.confirm(t('settings.confirmations.resetConfirm'))) {
      const defaultSettings = {
        defaultBlogId: '',
        defaultTemplate: '',
        autoSaveInterval: 5,
        autoBackup: true,
        confirmBeforeDelete: true,
        defaultPublishStatus: 'draft'
      };
      
      setSettings(defaultSettings);
      localStorage.setItem('blogcraft_settings', JSON.stringify(defaultSettings));
      alert(t('settings.confirmations.resetSuccess'));
    }
  };

  /**
   * Limpa todos os dados locais
   */
  const handleClearData = () => {
    if (window.confirm(t('settings.confirmations.clearDataConfirm'))) {
      // Manter apenas o token de autenticação
      const token = localStorage.getItem('blogcraft_token');
      const currentLocale = i18n.getLocale(); // Preservar o idioma atual
      
      // Limpar localStorage
      localStorage.clear();
      
      // Restaurar o token e idioma
      if (token) {
        localStorage.setItem('blogcraft_token', token);
      }
      localStorage.setItem('blogcraft_locale', currentLocale);
      
      // Recarregar a página
      window.location.reload();
    }
  };

  /**
   * Realiza logout
   */
  const handleLogout = () => {
    if (window.confirm(t('auth.confirmLogout'))) {
      localStorage.removeItem('blogcraft_token');
      navigate('/');
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-content">
        <h1>{t('settings.title')}</h1>
        
        {loading ? (
          <div className="loading">{t('common.loading')}</div>
        ) : error ? (
          <div className="error-message">{t('common.error', { message: error })}</div>
        ) : (
          <div className="settings-form">
            <div className="setting-group">
              <h2>{t('settings.sections.general')}</h2>
              
              <div className="setting-item">
                <label htmlFor="defaultBlog">{t('settings.fields.defaultBlog')}</label>
                <select
                  id="defaultBlog"
                  value={settings.defaultBlogId}
                  onChange={(e) => handleSettingChange(e, 'defaultBlogId')}
                >
                  <option value="">{t('common.selectOption')}</option>
                  {blogs.map(blog => (
                    <option key={blog.id} value={blog.id}>{blog.name}</option>
                  ))}
                </select>
                <p className="setting-description">{t('settings.fields.defaultBlogDesc')}</p>
              </div>
              
              <div className="setting-item">
                <label htmlFor="defaultTemplate">{t('settings.fields.defaultTemplate')}</label>
                <select
                  id="defaultTemplate"
                  value={settings.defaultTemplate}
                  onChange={(e) => handleSettingChange(e, 'defaultTemplate')}
                >
                  <option value="">{t('editor.templates.none')}</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                  ))}
                </select>
                <p className="setting-description">{t('settings.fields.defaultTemplateDesc')}</p>
              </div>
              
              <div className="setting-item">
                <label htmlFor="defaultPublishStatus">{t('settings.fields.publishStatus')}</label>
                <select
                  id="defaultPublishStatus"
                  value={settings.defaultPublishStatus}
                  onChange={(e) => handleSettingChange(e, 'defaultPublishStatus')}
                >
                  <option value="draft">{t('dashboard.posts.status.draft')}</option>
                  <option value="publish">{t('dashboard.posts.status.published')}</option>
                  <option value="scheduled">{t('dashboard.posts.status.scheduled')}</option>
                </select>
                <p className="setting-description">{t('settings.fields.publishStatusDesc')}</p>
              </div>
            </div>
            
            <div className="setting-group">
              <h2>{t('settings.sections.autoSave')}</h2>
              
              <div className="setting-item">
                <label htmlFor="autoSaveInterval">{t('settings.fields.autoSaveInterval')}</label>
                <input
                  id="autoSaveInterval"
                  type="number"
                  min="1"
                  max="60"
                  value={settings.autoSaveInterval}
                  onChange={(e) => handleSettingChange(e, 'autoSaveInterval')}
                />
                <p className="setting-description">{t('settings.fields.autoSaveIntervalDesc')}</p>
              </div>
              
              <div className="setting-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.autoBackup}
                    onChange={(e) => handleSettingChange(e, 'autoBackup')}
                  />
                  {t('settings.fields.autoBackup')}
                </label>
                <p className="setting-description">{t('settings.fields.autoBackupDesc')}</p>
              </div>
            </div>
            
            <div className="setting-group">
              <h2>{t('settings.sections.security')}</h2>
              
              <div className="setting-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.confirmBeforeDelete}
                    onChange={(e) => handleSettingChange(e, 'confirmBeforeDelete')}
                  />
                  {t('settings.fields.confirmDelete')}
                </label>
                <p className="setting-description">{t('settings.fields.confirmDeleteDesc')}</p>
              </div>
            </div>
            
            <div className="setting-group">
              <h2>{t('settings.sections.appearance')}</h2>
              
              <div className="setting-item">
                <label>{t('settings.fields.theme')}</label>
                <div className="theme-toggle">
                  <button 
                    className={`theme-button ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => toggleTheme('light')}
                  >
                    {t('settings.fields.themeLight')}
                  </button>
                  <button 
                    className={`theme-button ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => toggleTheme('dark')}
                  >
                    {t('settings.fields.themeDark')}
                  </button>
                </div>
                <p className="setting-description">{t('settings.fields.themeDesc')}</p>
              </div>
              
              {/* Seleção de idioma */}
              <div className="setting-item">
                <label htmlFor="language">{t('settings.fields.language')}</label>
                <select
                  id="language"
                  value={language}
                  onChange={handleLanguageChange}
                >
                  <option value={LOCALES.PT_PT}>Português</option>
                  <option value={LOCALES.EN_US}>English</option>
                </select>
                <p className="setting-description">{t('settings.fields.languageDesc')}</p>
              </div>
            </div>
            
            <div className="setting-group">
              <h2>{t('settings.sections.dataManagement')}</h2>
              
              <div className="data-actions">
                <button className="reset-settings-button" onClick={handleResetSettings}>
                  {t('settings.buttons.reset')}
                </button>
                
                <button className="clear-data-button" onClick={handleClearData}>
                  {t('settings.buttons.clearData')}
                </button>
              </div>
            </div>
            
            <div className="setting-actions">
              <button className="save-settings-button" onClick={handleSaveSettings}>
                {t('settings.buttons.save')}
              </button>
              
              <button className="logout-button" onClick={handleLogout}>
                {t('auth.logout')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;