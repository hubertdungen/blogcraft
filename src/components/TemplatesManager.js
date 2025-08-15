import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { saveAs } from 'file-saver';
import Feedback from './Feedback';
import i18n, { t } from '../services/I18nService';

/**
 * Componente de Gerenciamento de Templates
 * 
 * Permite ao usuário:
 * - Criar novos templates
 * - Editar templates existentes
 * - Excluir templates
 * - Exportar e importar templates
 */
function TemplatesManager({ theme }) {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const editorRef = useRef(null);
  const [_locale, setLocale] = useState(i18n.getLocale());

  useEffect(() => {
    const remove = i18n.addListener(setLocale);
    return remove;
  }, []);
  
  // Carregar templates salvos no localStorage ao montar o componente
  useEffect(() => {
    loadTemplates();
  }, []);
  
  /**
   * Carrega os templates do localStorage
   */
  const loadTemplates = () => {
    try {
      const savedTemplates = JSON.parse(localStorage.getItem('blogcraft_templates') || '[]');
      setTemplates(savedTemplates);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      setTemplates([]);
      setFeedback({
        type: 'error',
        message: 'Erro ao carregar templates. Os dados podem estar corrompidos.'
      });
    }
  };
  
  /**
   * Seleciona um template para edição
   */
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setTemplateName(template.name);
    setTemplateDescription(template.description || '');
    setIsEditing(true);
  };
  
  /**
   * Inicia a criação de um novo template
   */
  const handleCreateTemplate = () => {
    const newTemplate = {
      id: Date.now(),
      name: 'Novo Template',
      description: '',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setSelectedTemplate(newTemplate);
    setTemplateName('Novo Template');
    setTemplateDescription('');
    setIsEditing(true);
  };
  
  /**
   * Salva o template atual (novo ou editado)
   */
  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      setFeedback({
        type: 'error',
        message: 'Por favor, informe um nome para o template.'
      });
      return;
    }
    
    if (!editorRef.current || !editorRef.current.getData) {
      setFeedback({
        type: 'error',
        message: 'Editor não inicializado. Por favor, tente novamente.'
      });
      return;
    }
    
    const content = editorRef.current.getData();
    
    if (!content.trim()) {
      setFeedback({
        type: 'error',
        message: 'O conteúdo do template não pode estar vazio.'
      });
      return;
    }
    
    const updatedTemplate = {
      ...selectedTemplate,
      name: templateName.trim(),
      description: templateDescription.trim(),
      content: content,
      updatedAt: new Date().toISOString()
    };
    
    let updatedTemplates;
    
    if (templates.some(t => t.id === updatedTemplate.id)) {
      // Atualizar template existente
      updatedTemplates = templates.map(t => 
        t.id === updatedTemplate.id ? updatedTemplate : t
      );
    } else {
      // Adicionar novo template
      updatedTemplates = [...templates, updatedTemplate];
    }
    
    // Salvar no localStorage
    localStorage.setItem('blogcraft_templates', JSON.stringify(updatedTemplates));
    
    // Atualizar estado
    setTemplates(updatedTemplates);
    setSelectedTemplate(updatedTemplate);
    
    setFeedback({
      type: 'success',
      message: 'Template salvo com sucesso!',
      duration: 3000
    });
  };
  
  /**
   * Exclui um template
   */
  const handleDeleteTemplate = (templateId) => {
    if (!window.confirm('Tem certeza que deseja excluir este template? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    
    // Salvar no localStorage
    localStorage.setItem('blogcraft_templates', JSON.stringify(updatedTemplates));
    
    // Atualizar estado
    setTemplates(updatedTemplates);
    
    if (selectedTemplate && selectedTemplate.id === templateId) {
      setSelectedTemplate(null);
      setTemplateName('');
      setTemplateDescription('');
      setIsEditing(false);
    }
    
    setFeedback({
      type: 'success',
      message: 'Template excluído com sucesso!',
      duration: 3000
    });
  };
  
  /**
   * Exporta um template para arquivo JSON
   */
  const handleExportTemplate = (template) => {
    const templateData = JSON.stringify(template, null, 2);
    const blob = new Blob([templateData], { type: 'application/json' });
    saveAs(blob, `template-${template.name.toLowerCase().replace(/\s+/g, '-')}.json`);
  };
  
  /**
   * Exporta todos os templates para arquivo JSON
   */
  const handleExportAllTemplates = () => {
    if (templates.length === 0) {
      setFeedback({
        type: 'error',
        message: 'Não há templates para exportar.'
      });
      return;
    }
    
    const templatesData = JSON.stringify(templates, null, 2);
    const blob = new Blob([templatesData], { type: 'application/json' });
    saveAs(blob, `blogcraft-templates.json`);
  };
  
  /**
   * Importa templates de um arquivo JSON
   */
  const handleImportTemplates = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        
        // Verificar se é um array ou um único template
        if (Array.isArray(importedData)) {
          // Validar cada template
          const validTemplates = importedData.filter(template => 
            template.id && template.name && template.content
          );
          
          if (validTemplates.length === 0) {
            setFeedback({
              type: 'error',
              message: 'Nenhum template válido encontrado no arquivo.'
            });
            return;
          }
          
          // Perguntar se deseja substituir ou mesclar
          const shouldReplace = window.confirm(
            `Importar ${validTemplates.length} templates. Deseja substituir todos os templates existentes? ` +
            `Escolha "OK" para substituir ou "Cancelar" para mesclar com os templates existentes.`
          );
          
          let updatedTemplates;
          
          if (shouldReplace) {
            // Substituir todos os templates
            updatedTemplates = [...validTemplates];
          } else {
            // Mesclar, mantendo os templates existentes que não têm IDs conflitantes
            const existingIds = templates.map(t => t.id);
            
            // Filtrar templates importados que não têm ID conflitante
            const nonConflictingTemplates = validTemplates.filter(
              t => !existingIds.includes(t.id)
            );
            
            // Verificar se há conflitos e perguntar o que fazer com eles
            const conflictingTemplates = validTemplates.filter(
              t => existingIds.includes(t.id)
            );
            
            if (conflictingTemplates.length > 0) {
              const shouldOverwrite = window.confirm(
                `${conflictingTemplates.length} templates têm IDs conflitantes. ` +
                `Deseja sobrescrever os templates existentes com o mesmo ID? ` +
                `Escolha "OK" para sobrescrever ou "Cancelar" para manter os templates existentes.`
              );
              
              if (shouldOverwrite) {
                // Criar um mapa com os templates importados para substituição
                const importMap = Object.fromEntries(
                  validTemplates.map(t => [t.id, t])
                );
                
                // Substituir templates existentes com os importados quando houver ID igual
                updatedTemplates = [
                  ...templates.map(t => importMap[t.id] || t),
                  ...nonConflictingTemplates
                ];
              } else {
                // Manter templates existentes e adicionar apenas os não conflitantes
                updatedTemplates = [...templates, ...nonConflictingTemplates];
              }
            } else {
              // Nenhum conflito, simplesmente adicionar os novos templates
              updatedTemplates = [...templates, ...validTemplates];
            }
          }
          
          // Salvar no localStorage
          localStorage.setItem('blogcraft_templates', JSON.stringify(updatedTemplates));
          
          // Atualizar estado
          setTemplates(updatedTemplates);
          
          setFeedback({
            type: 'success',
            message: `Importação concluída! ${validTemplates.length} templates importados.`,
            duration: 3000
          });
        } else if (importedData.id && importedData.name && importedData.content) {
          // É um único template
          const newTemplate = {
            ...importedData,
            // Gerar um novo ID para evitar conflitos
            id: Date.now(),
            updatedAt: new Date().toISOString()
          };
          
          const updatedTemplates = [...templates, newTemplate];
          
          // Salvar no localStorage
          localStorage.setItem('blogcraft_templates', JSON.stringify(updatedTemplates));
          
          // Atualizar estado
          setTemplates(updatedTemplates);
          
          setFeedback({
            type: 'success',
            message: `Template "${newTemplate.name}" importado com sucesso!`,
            duration: 3000
          });
        } else {
          setFeedback({
            type: 'error',
            message: 'O arquivo não contém templates válidos.'
          });
        }
      } catch (error) {
        console.error('Erro ao importar templates:', error);
        setFeedback({
          type: 'error',
          message: 'Erro ao processar o arquivo. Verifique se é um arquivo JSON válido.'
        });
      }
    };
    
    reader.readAsText(file);
  };
  
  /**
   * Cancela a edição do template atual
   */
  const handleCancelEdit = () => {
    if (window.confirm('Há alterações não salvas. Deseja realmente cancelar?')) {
      setSelectedTemplate(null);
      setTemplateName('');
      setTemplateDescription('');
      setIsEditing(false);
    }
  };
  
  /**
   * Usa o template atual para criar um novo post
   */
  const handleUseTemplate = (template) => {
    navigate('/editor', { state: { 
      content: template.content,
      fromTemplate: template.id
    }});
  };
  
  /**
   * Formata a data para exibição
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="templates-content">
      <div className="templates-header">
        <h1>{t('templates.title')}</h1>
        
        <div className="templates-actions">
          <button 
            className="create-template-button" 
            onClick={handleCreateTemplate}
            disabled={isEditing}
          >
            Criar Novo Template
          </button>
          
          <button 
            className="export-all-button" 
            onClick={handleExportAllTemplates}
            disabled={templates.length === 0}
          >
            Exportar Todos
          </button>
          
          <label className="import-button">
            Importar Templates
            <input
              type="file"
              accept=".json"
              onChange={handleImportTemplates}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>
      
      {feedback && (
        <Feedback 
          type={feedback.type} 
          message={feedback.message} 
          onDismiss={() => setFeedback(null)}
        />
      )}
      
      <div className="templates-layout">
        <div className="templates-list">
          <h2>Templates Disponíveis ({templates.length})</h2>
          
          {templates.length === 0 ? (
            <div className="templates-empty">
              <p>Nenhum template disponível.</p>
              <p>Crie um novo template ou importe templates existentes.</p>
            </div>
          ) : (
            templates.map(template => (
              <div 
                key={template.id} 
                className={`template-item ${selectedTemplate && selectedTemplate.id === template.id ? 'selected' : ''}`}
              >
                <div className="template-info" onClick={() => handleSelectTemplate(template)}>
                  <h3>{template.name}</h3>
                  {template.description && (
                    <p className="template-description">{template.description}</p>
                  )}
                  <p className="template-date">
                    Atualizado em: {formatDate(template.updatedAt || template.createdAt)}
                  </p>
                </div>
                
                <div className="template-actions">
                  <button
                    className="use-template-button"
                    onClick={() => handleUseTemplate(template)}
                    title="Usar este template para criar um novo post"
                  >
                    Usar
                  </button>
                  
                  <button
                    className="export-template-button"
                    onClick={() => handleExportTemplate(template)}
                    title="Exportar este template como arquivo JSON"
                  >
                    Exportar
                  </button>
                  
                  <button 
                    className="delete-template-button"
                    onClick={() => handleDeleteTemplate(template.id)}
                    title="Excluir este template"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {isEditing && selectedTemplate && (
          <div className="template-editor">
            <div className="template-editor-header">
              <h2>{selectedTemplate.id ? 'Editar Template' : 'Novo Template'}</h2>
              
              <div className="template-editor-actions">
                <button 
                  className="save-template-button" 
                  onClick={handleSaveTemplate}
                >
                  Salvar Template
                </button>
                
                <button
                  className="cancel-edit-button"
                  onClick={handleCancelEdit}
                >
                  Cancelar
                </button>
              </div>
            </div>
            
            <div className="template-form">
              <div className="template-form-field">
                <label htmlFor="template-name">Nome do Template:</label>
                <input
                  id="template-name"
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Digite um nome para o template"
                  required
                />
              </div>
              
              <div className="template-form-field">
                <label htmlFor="template-description">Descrição (opcional):</label>
                <input
                  id="template-description"
                  type="text"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Uma breve descrição do template"
                />
              </div>
              
              <div className="template-editor-content">
                <label>Conteúdo do Template:</label>
                <CKEditor
                  editor={ClassicEditor}
                  data={selectedTemplate.content}
                  onReady={editor => {
                    // Armazenar referência ao editor
                    editorRef.current = editor;
                    
                    // Configurações adicionais
                    editor.ui.view.editable.element.style.minHeight = '400px';
                  }}
                  onChange={(event, editor) => {
                    // Nada a fazer aqui, salvamos apenas quando o usuário clica em salvar
                  }}
                  config={{
                    toolbar: [
                      'heading',
                      '|',
                      'bold', 'italic', 'strikethrough', 'underline',
                      '|',
                      'link', 'bulletedList', 'numberedList',
                      '|',
                      'indent', 'outdent',
                      '|',
                      'blockQuote', 'insertTable',
                      '|',
                      'undo', 'redo'
                    ],
                    language: 'pt-br'
                  }}
                />
              </div>
            </div>
          </div>
        )}
        
        {!isEditing && (
          <div className="template-preview">
            <h2>Selecione um template para editar</h2>
            <p>Ou clique em "Criar Novo Template" para começar um novo.</p>
            
            <div className="template-tips">
              <h3>Dicas para Templates</h3>
              <ul>
                <li>Crie templates para tipos específicos de posts (revisões, tutoriais, notícias, etc.)</li>
                <li>Inclua espaços reservados para o conteúdo que você normalmente adiciona</li>
                <li>Use estilos consistentes para manter a identidade visual do seu blog</li>
                <li>Exporte seus templates favoritos para compartilhar com outros usuários</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TemplatesManager;