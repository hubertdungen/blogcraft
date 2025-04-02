import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BloggerService from '../services/BloggerService';

/**
 * Componente Settings - Configurações da aplicação
 * 
 * Permite ao usuário configurar:
 * - Blog padrão
 * - Template padrão
 * - Intervalo de salvamento automático
 * - Backup automático
 * - Preferências visuais
 */
function Settings({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [templates, setTemplates] = useState([]);
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
      setError('Erro ao carregar configurações. As configurações padrão serão usadas.');
    }
  };

  /**
   * Carrega os blogs do usuário
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
      setError(`Não foi possível carregar seus blogs: ${error.message}`);
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
   * Salva as configurações
   */
  const handleSaveSettings = () => {
    try {
      localStorage.setItem('blogcraft_settings', JSON.stringify(settings));
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert(`Erro ao salvar configurações: ${error.message}`);
    }
  };

  /**
   * Restaura as configurações padrão
   */
  const handleResetSettings = () => {
    if (window.confirm('Tem certeza que deseja restaurar as configurações padrão? Esta ação não pode ser desfeita.')) {
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
      alert('Configurações restauradas para os valores padrão.');
    }
  };

  /**
   * Limpa todos os dados locais
   */
  const handleClearData = () => {
    if (window.confirm('ATENÇÃO: Isso apagará todos os seus dados locais, incluindo templates e configurações. Esta ação não pode ser desfeita. Deseja continuar?')) {
      // Manter apenas o token de autenticação
      const token = localStorage.getItem('blogcraft_token');
      
      // Limpar localStorage
      localStorage.clear();
      
      // Restaurar o token
      if (token) {
        localStorage.setItem('blogcraft_token', token);
      }
      
      // Recarregar a página
      window.location.reload();
    }
  };

  /**
   * Realiza logout
   */
  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair? Seus dados locais serão mantidos.')) {
      localStorage.removeItem('blogcraft_token');
      navigate('/');
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-content">
        <h1>Configurações</h1>
        
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="settings-form">
            <div className="setting-group">
              <h2>Preferências Gerais</h2>
              
              <div className="setting-item">
                <label htmlFor="defaultBlog">Blog Padrão:</label>
                <select
                  id="defaultBlog"
                  value={settings.defaultBlogId}
                  onChange={(e) => handleSettingChange(e, 'defaultBlogId')}
                >
                  <option value="">Selecionar...</option>
                  {blogs.map(blog => (
                    <option key={blog.id} value={blog.id}>{blog.name}</option>
                  ))}
                </select>
                <p className="setting-description">Blog selecionado por padrão ao criar um novo post.</p>
              </div>
              
              <div className="setting-item">
                <label htmlFor="defaultTemplate">Template Padrão:</label>
                <select
                  id="defaultTemplate"
                  value={settings.defaultTemplate}
                  onChange={(e) => handleSettingChange(e, 'defaultTemplate')}
                >
                  <option value="">Nenhum</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                  ))}
                </select>
                <p className="setting-description">Template carregado automaticamente ao criar um novo post.</p>
              </div>
              
              <div className="setting-item">
                <label htmlFor="defaultPublishStatus">Status de Publicação Padrão:</label>
                <select
                  id="defaultPublishStatus"
                  value={settings.defaultPublishStatus}
                  onChange={(e) => handleSettingChange(e, 'defaultPublishStatus')}
                >
                  <option value="draft">Rascunho</option>
                  <option value="publish">Publicado</option>
                  <option value="scheduled">Agendado</option>
                </select>
                <p className="setting-description">Status padrão ao salvar posts.</p>
              </div>
            </div>
            
            <div className="setting-group">
              <h2>Salvamento Automático</h2>
              
              <div className="setting-item">
                <label htmlFor="autoSaveInterval">Intervalo de Salvamento Automático (minutos):</label>
                <input
                  id="autoSaveInterval"
                  type="number"
                  min="1"
                  max="60"
                  value={settings.autoSaveInterval}
                  onChange={(e) => handleSettingChange(e, 'autoSaveInterval')}
                />
                <p className="setting-description">Intervalo de tempo para salvamento automático de rascunhos.</p>
              </div>
              
              <div className="setting-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.autoBackup}
                    onChange={(e) => handleSettingChange(e, 'autoBackup')}
                  />
                  Backup Automático de Rascunhos
                </label>
                <p className="setting-description">Cria cópias locais de backup dos seus rascunhos.</p>
              </div>
            </div>
            
            <div className="setting-group">
              <h2>Segurança</h2>
              
              <div className="setting-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.confirmBeforeDelete}
                    onChange={(e) => handleSettingChange(e, 'confirmBeforeDelete')}
                  />
                  Confirmar antes de excluir
                </label>
                <p className="setting-description">Solicita confirmação antes de excluir posts ou templates.</p>
              </div>
            </div>
            
            <div className="setting-group">
              <h2>Aparência</h2>
              
              <div className="setting-item">
                <label>Tema:</label>
                <div className="theme-toggle">
                  <button 
                    className={`theme-button ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => toggleTheme('light')}
                  >
                    Claro
                  </button>
                  <button 
                    className={`theme-button ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => toggleTheme('dark')}
                  >
                    Escuro
                  </button>
                </div>
                <p className="setting-description">Escolha entre tema claro ou escuro para a interface.</p>
              </div>
            </div>
            
            <div className="setting-group">
              <h2>Gerenciamento de Dados</h2>
              
              <div className="data-actions">
                <button className="reset-settings-button" onClick={handleResetSettings}>
                  Restaurar Configurações Padrão
                </button>
                
                <button className="clear-data-button" onClick={handleClearData}>
                  Limpar Todos os Dados Locais
                </button>
              </div>
            </div>
            
            <div className="setting-actions">
              <button className="save-settings-button" onClick={handleSaveSettings}>
                Salvar Configurações
              </button>
              
              <button className="logout-button" onClick={handleLogout}>
                Sair
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;