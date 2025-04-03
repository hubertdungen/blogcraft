import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import DateTimePicker from 'react-datetime-picker';
import { saveAs } from 'file-saver';
import BloggerService from '../services/BloggerService';
import AuthService from '../services/AuthService';
import Feedback from './Feedback';

/**
 * Componente do Editor de Posts
 * 
 * Recursos:
 * - Editor CKEditor para conteúdo rico (semelhante ao Word)
 * - Gerenciamento de tags/labels
 * - Suporte a templates
 * - Agendamento de publicações
 * - Metadados (SEO)
 * - Exportação em diferentes formatos
 */
function PostEditor({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { postId } = useParams();
  const editorRef = useRef(null);
  
  // Estados do editor
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState('');
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    labels: [],
    isDraft: true,
    scheduledPublish: null
  });
  
  // Estados para templates
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  
  // Estados para metadados
  const [metadata, setMetadata] = useState({
    description: '',
    author: '',
    keywords: ''
  });
  const [showMetadataEditor, setShowMetadataEditor] = useState(false);
  
  // Estado para mensagens de feedback
  const [feedback, setFeedback] = useState(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);

  // Efeito para carregar dados iniciais
  useEffect(() => {
    // Carregar templates salvos localmente
    const savedTemplates = JSON.parse(localStorage.getItem('blogcraft_templates') || '[]');
    setTemplates(savedTemplates);
    
    // Carregar lista de blogs do usuário
    fetchUserBlogs();
    
    // Verificar se há dados passados via state (rota)
    if (location.state) {
      const { blogId, title, content, labels } = location.state;
      
      if (blogId) {
        setSelectedBlog(blogId);
      }
      
      if (title || content || labels) {
        setPostData(prev => ({
          ...prev,
          title: title || prev.title,
          content: content || prev.content,
          labels: labels || prev.labels
        }));
      }
    }
    
    // Se houver um postId, carregar os dados do post existente
    if (postId && selectedBlog) {
      fetchPost(selectedBlog, postId);
    }
    
    // Configurar autosalvamento
    const settings = JSON.parse(localStorage.getItem('blogcraft_settings') || '{}');
    const autoSaveInterval = settings.autoSaveInterval || 5; // 5 minutos padrão
    
    const timer = setInterval(() => {
      handleAutoSave();
    }, autoSaveInterval * 60 * 1000);
    
    setAutoSaveTimer(timer);
    
    // Limpar timer ao desmontar componente
    return () => {
      if (autoSaveTimer) {
        clearInterval(autoSaveTimer);
      }
    };
  }, [location, postId]);

  // Efeito adicional para carregar post quando o blog selecionado mudar e houver postId
  useEffect(() => {
    if (postId && selectedBlog) {
      fetchPost(selectedBlog, postId);
    }
  }, [selectedBlog, postId]);

  /**
   * Auto-salva o post atual como rascunho
   */
  const handleAutoSave = () => {
    if (!postData.title || !selectedBlog) return;
    
    // Salvar como rascunho local
    const key = `blogcraft_draft_${selectedBlog}_${postId || 'new'}`;
    const draftData = {
      ...postData,
      metadata,
      savedAt: new Date().toISOString()
    };
    
    localStorage.setItem(key, JSON.stringify(draftData));
    
    setFeedback({
      type: 'info',
      message: `Rascunho salvo automaticamente às ${new Date().toLocaleTimeString()}`,
      duration: 3000
    });
  };

  /**
   * Busca a lista de blogs do usuário autenticado
   */
  const fetchUserBlogs = async () => {
    try {
      const token = localStorage.getItem('blogcraft_token');
      
      if (!token) {
        navigate('/');
        return;
      }
      
      setLoading(true);
      
      // Buscar blogs usando o serviço
      const data = await BloggerService.getUserBlogs();
      
      if (data.items) {
        setBlogs(data.items);
        
        // Se não houver blog selecionado, selecionar o primeiro
        if (!selectedBlog && data.items.length > 0) {
          setSelectedBlog(data.items[0].id);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar blogs:', error);
      
      // Se for erro de autenticação, redirecionar para login
      if (error.message.includes('autenticação') || 
          error.message.includes('login') || 
          error.message.includes('token')) {
        
        AuthService.removeAuthToken();
        navigate('/', { replace: true });
        return;
      }
      
      setFeedback({
        type: 'error',
        message: 'Não foi possível carregar seus blogs. Por favor, verifique sua conexão e tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Busca os dados de um post existente
   */
  const fetchPost = async (blogId, postId) => {
    try {
      setLoading(true);
      
      // Buscar o post existente
      const data = await BloggerService.getPost(blogId, postId);
      
      // Extrair metadados do conteúdo (se houver)
      const metaDescription = extractMetadata(data.content, 'description');
      const metaAuthor = extractMetadata(data.content, 'author');
      const metaKeywords = extractMetadata(data.content, 'keywords');
      
      setPostData({
        title: data.title || '',
        content: data.content || '',
        labels: data.labels || [],
        isDraft: data.status !== 'LIVE',
        scheduledPublish: data.scheduled ? new Date(data.scheduled) : null
      });
      
      setMetadata({
        description: metaDescription || '',
        author: metaAuthor || '',
        keywords: metaKeywords || ''
      });
    } catch (error) {
      console.error('Erro ao buscar post:', error);
      
      // Se for erro de autenticação, redirecionar para login
      if (error.message.includes('autenticação') || 
          error.message.includes('login') || 
          error.message.includes('token')) {
        
        AuthService.removeAuthToken();
        navigate('/', { replace: true });
        return;
      }
      
      setFeedback({
        type: 'error',
        message: 'Não foi possível carregar o post. Por favor, verifique sua conexão e tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Extrai metadados do conteúdo HTML
   */
  const extractMetadata = (content, metaType) => {
    if (!content) return '';
    
    const metaRegex = new RegExp(`<meta name="${metaType}" content="([^"]*)"`, 'i');
    const match = content.match(metaRegex);
    
    return match ? match[1] : '';
  };

  /**
   * Handler para mudanças no editor CKEditor
   */
  const handleEditorChange = (event, editor) => {
    const content = editor.getData();
    setPostData(prev => ({
      ...prev,
      content
    }));
  };

  /**
   * Handler para mudança no título
   */
  const handleTitleChange = (e) => {
    setPostData(prev => ({
      ...prev,
      title: e.target.value
    }));
  };

  /**
   * Handler para mudança nas tags/labels
   */
  const handleLabelsChange = (e) => {
    const labels = e.target.value.split(',').map(label => label.trim()).filter(Boolean);
    setPostData(prev => ({
      ...prev,
      labels
    }));
  };

  /**
   * Handler para mudança na data de agendamento
   */
  const handleScheduleChange = (date) => {
    setPostData(prev => ({
      ...prev,
      scheduledPublish: date
    }));
  };

  /**
   * Handler para alternar entre rascunho e publicado
   */
  const handleDraftToggle = () => {
    setPostData(prev => ({
      ...prev,
      isDraft: !prev.isDraft
    }));
  };

  /**
   * Handler para mudanças nos metadados
   */
  const handleMetadataChange = (e, field) => {
    setMetadata(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  /**
   * Salva o conteúdo atual como template
   */
  const handleSaveTemplate = () => {
    const templateName = prompt('Nome do template:');
    
    if (!templateName) return;
    
    const newTemplate = {
      id: Date.now(),
      name: templateName,
      content: postData.content,
      createdAt: new Date().toISOString()
    };
    
    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem('blogcraft_templates', JSON.stringify(updatedTemplates));
    
    setFeedback({
      type: 'success',
      message: 'Template salvo com sucesso!',
      duration: 3000
    });
  };

  /**
   * Carrega um template selecionado
   */
  const handleTemplateSelect = (e) => {
    const templateId = parseInt(e.target.value);
    
    if (templateId === 0) {
      setSelectedTemplate(null);
      return;
    }
    
    const template = templates.find(t => t.id === templateId);
    
    if (template) {
      setSelectedTemplate(template);
      setPostData(prev => ({
        ...prev,
        content: template.content
      }));
      
      // Atualizar o editor com o conteúdo do template
      if (editorRef.current) {
        editorRef.current.setData(template.content);
      }
    }
  };

  /**
   * Insere metadata no conteúdo HTML
   */
  const insertMetadata = (content, metaType, metaValue) => {
    const metaTag = `<meta name="${metaType}" content="${metaValue}">`;
    
    // Verificar se já existe a meta tag
    const metaRegex = new RegExp(`<meta name="${metaType}" content="[^"]*"`, 'i');
    
    if (metaRegex.test(content)) {
      // Substituir a meta tag existente
      return content.replace(metaRegex, metaTag);
    } else {
      // Adicionar nova meta tag após a tag <head> ou no início do documento
      if (content.includes('<head>')) {
        return content.replace('<head>', `<head>\n  ${metaTag}`);
      } else if (content.includes('<html>')) {
        return content.replace('<html>', `<html>\n<head>\n  ${metaTag}\n</head>`);
      } else {
        return `<head>\n  ${metaTag}\n</head>\n${content}`;
      }
    }
  };

  /**
   * Salva o post (como rascunho ou publicado)
   */
  const handleSavePost = async (publish = false) => {
    if (!selectedBlog) {
      setFeedback({
        type: 'error',
        message: 'Por favor, selecione um blog antes de salvar o post.'
      });
      return;
    }
    
    if (!postData.title.trim()) {
      setFeedback({
        type: 'error',
        message: 'Por favor, insira um título para o post.'
      });
      return;
    }
    
    try {
      setSaving(true);
      
      // Adicionar metadados ao conteúdo
      let finalContent = postData.content;
      
      if (metadata.description) {
        finalContent = insertMetadata(finalContent, 'description', metadata.description);
      }
      
      if (metadata.author) {
        finalContent = insertMetadata(finalContent, 'author', metadata.author);
      }
      
      if (metadata.keywords) {
        finalContent = insertMetadata(finalContent, 'keywords', metadata.keywords);
      }
      
      const postPayload = {
        kind: 'blogger#post',
        title: postData.title,
        content: finalContent,
        labels: postData.labels
      };
      
      if (postData.scheduledPublish && publish) {
        postPayload.published = postData.scheduledPublish.toISOString();
      }
      
      let savedPost;
      
      // Determinar se estamos criando ou atualizando um post
      if (postId) {
        // Atualizar post existente
        savedPost = await BloggerService.updatePost(selectedBlog, postId, postPayload);
      } else {
        // Criar novo post
        savedPost = await BloggerService.createPost(selectedBlog, postPayload);
      }
      
      // Se pediu para publicar e não está agendado, publicar imediatamente
      if (publish && !postData.scheduledPublish) {
        await BloggerService.publishPost(selectedBlog, savedPost.id);
      }
      
      setFeedback({
        type: 'success',
        message: publish ? 'Post publicado com sucesso!' : 'Rascunho salvo com sucesso!',
        duration: 3000
      });
      
      // Limpar rascunho local após salvar
      const draftKey = `blogcraft_draft_${selectedBlog}_${postId || 'new'}`;
      localStorage.removeItem(draftKey);
      
      // Redirecionar para o dashboard após um breve atraso
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      
      // Se for erro de autenticação, redirecionar para login
      if (error.message.includes('autenticação') || 
          error.message.includes('login') || 
          error.message.includes('token')) {
        
        AuthService.removeAuthToken();
        navigate('/', { replace: true });
        return;
      }
      
      setFeedback({
        type: 'error',
        message: `Ocorreu um erro ao salvar o post: ${error.message}`
      });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Salvar post como rascunho
   */
  const handleSaveAsDraft = () => {
    handleSavePost(false);
  };

  /**
   * Publicar post
   */
  const handlePublish = () => {
    handleSavePost(true);
  };

  /**
   * Exportar para Word
   */
  const handleExportWord = () => {
    // Criar um arquivo HTML que seja compatível com Word
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${postData.title}</title>
      </head>
      <body>
        <h1>${postData.title}</h1>
        ${postData.content}
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    saveAs(blob, `${postData.title || 'post'}.doc`);
  };

  /**
   * Importar arquivo (TXT, DOC, DOCX, HTML)
   */
  const handleFileImport = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const fileContent = event.target.result;
      
      // Tentar extrair título e conteúdo
      let title = '';
      let content = '';
      
      if (file.name.endsWith('.txt')) {
        // Arquivo TXT - primeira linha como título, resto como conteúdo
        const lines = fileContent.split('\n');
        title = lines[0] || '';
        content = lines.slice(1).join('\n');
      } else if (file.name.endsWith('.doc') || file.name.endsWith('.docx') || file.name.endsWith('.html')) {
        // Arquivo Word/HTML - tentar extrair conteúdo
        try {
          const parser = new DOMParser();
          const doc = parser.parseFromString(fileContent, 'text/html');
          
          // Tentar obter o título
          const titleElement = doc.querySelector('title') || doc.querySelector('h1');
          title = titleElement ? titleElement.textContent : '';
          
          // Obter o conteúdo do body
          const bodyElement = doc.querySelector('body');
          content = bodyElement ? bodyElement.innerHTML : fileContent;
        } catch (error) {
          console.error('Erro ao processar arquivo:', error);
          content = fileContent;
        }
      }
      
      setPostData(prev => ({
        ...prev,
        title: title || prev.title,
        content: content || prev.content
      }));
      
      // Atualizar o editor com o novo conteúdo
      if (editorRef.current) {
        editorRef.current.setData(content);
      }
    };
    
    if (file.name.endsWith('.txt') || file.name.endsWith('.html')) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  /**
   * Render do componente
   */
  return (
    <div className="editor-content">
      <div className="editor-header">
        <h1>Editor de Post</h1>
        
        <div className="editor-actions">
          <button 
            className="save-draft-button" 
            onClick={handleSaveAsDraft}
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar Rascunho'}
          </button>
          
          <button 
            className="publish-button" 
            onClick={handlePublish}
            disabled={saving}
          >
            {saving ? 'Processando...' : (postData.scheduledPublish ? 'Agendar' : 'Publicar')}
          </button>
        </div>
      </div>
      
      {feedback && (
        <Feedback 
          type={feedback.type} 
          message={feedback.message} 
          onDismiss={() => setFeedback(null)}
        />
      )}
      
      {loading ? (
        <div className="loading">Carregando...</div>
      ) : (
        <>
          <div className="blog-selector">
            <label>Blog:</label>
            <select 
              value={selectedBlog} 
              onChange={(e) => setSelectedBlog(e.target.value)}
              disabled={!!postId} // Não permitir trocar o blog ao editar um post existente
            >
              {blogs.length === 0 ? (
                <option value="">Carregando blogs...</option>
              ) : (
                blogs.map(blog => (
                  <option key={blog.id} value={blog.id}>{blog.name}</option>
                ))
              )}
            </select>
          </div>
          
          <div className="post-options">
            <div className="title-input">
              <input
                type="text"
                placeholder="Título do post"
                value={postData.title}
                onChange={handleTitleChange}
              />
            </div>
            
            <div className="post-actions">
              <div className="labels-input">
                <label>Tags (separadas por vírgula):</label>
                <input
                  type="text"
                  value={postData.labels.join(', ')}
                  onChange={handleLabelsChange}
                  placeholder="Exemplo: tecnologia, tutorial, dicas"
                />
              </div>
              
              <div className="template-select">
                <label>Template:</label>
                <select onChange={handleTemplateSelect} value={selectedTemplate?.id || 0}>
                  <option value={0}>Selecionar template...</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                <button onClick={handleSaveTemplate}>Salvar como Template</button>
              </div>
              
              <div className="schedule-input">
                <label>
                  <input
                    type="checkbox"
                    checked={!!postData.scheduledPublish}
                    onChange={() => handleScheduleChange(postData.scheduledPublish ? null : new Date())}
                  />
                  Agendar publicação
                </label>
                
                {postData.scheduledPublish && (
                  <DateTimePicker
                    onChange={handleScheduleChange}
                    value={postData.scheduledPublish}
                    minDate={new Date()}
                    format="dd/MM/yyyy HH:mm"
                  />
                )}
              </div>
              
              <div className="draft-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={postData.isDraft}
                    onChange={handleDraftToggle}
                  />
                  Salvar como rascunho
                </label>
              </div>
              
              <div className="metadata-toggle">
                <button onClick={() => setShowMetadataEditor(!showMetadataEditor)}>
                  {showMetadataEditor ? 'Esconder Metadados' : 'Editar Metadados'}
                </button>
              </div>
              
              <div className="import-export">
                <button onClick={handleExportWord}>Exportar como Word</button>
                <label className="file-input-label">
                  Importar Arquivo
                  <input
                    type="file"
                    accept=".txt,.doc,.docx,.html"
                    onChange={handleFileImport}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
            
            {showMetadataEditor && (
              <div className="metadata-editor">
                <h3>Metadados</h3>
                
                <div className="metadata-field">
                  <label>Descrição (SEO):</label>
                  <input
                    type="text"
                    value={metadata.description}
                    onChange={(e) => handleMetadataChange(e, 'description')}
                    placeholder="Breve descrição do post para motores de busca"
                  />
                </div>
                
                <div className="metadata-field">
                  <label>Autor:</label>
                  <input
                    type="text"
                    value={metadata.author}
                    onChange={(e) => handleMetadataChange(e, 'author')}
                    placeholder="Nome do autor"
                  />
                </div>
                
                <div className="metadata-field">
                  <label>Palavras-chave (SEO):</label>
                  <input
                    type="text"
                    value={metadata.keywords}
                    onChange={(e) => handleMetadataChange(e, 'keywords')}
                    placeholder="Palavras-chave separadas por vírgula"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="rich-editor">
            <CKEditor
              editor={ClassicEditor}
              data={postData.content}
              onChange={handleEditorChange}
              onReady={editor => {
                // Armazenar referência ao editor
                editorRef.current = editor;
                
                // Configurações adicionais
                editor.ui.view.editable.element.style.minHeight = '500px';
              }}
              config={{
                toolbar: [
                  'heading',
                  '|',
                  'bold', 'italic', 'strikethrough', 'underline',
                  '|',
                  'link', 'bulletedList', 'numberedList', 'todoList',
                  '|',
                  'indent', 'outdent',
                  '|',
                  'imageUpload', 'blockQuote', 'insertTable', 'mediaEmbed',
                  '|',
                  'undo', 'redo',
                  '|',
                  'fontBackgroundColor', 'fontColor',
                  '|',
                  'fontSize', 'fontFamily',
                  '|',
                  'alignment',
                  '|',
                  'horizontalLine'
                ],
                image: {
                  // Configuração para upload de imagens
                  toolbar: [
                    'imageTextAlternative',
                    'imageStyle:full',
                    'imageStyle:side'
                  ]
                },
                table: {
                  contentToolbar: [
                    'tableColumn', 'tableRow', 'mergeTableCells',
                    'tableCellProperties', 'tableProperties'
                  ]
                },
                language: 'pt-br'
              }}
            />
          </div>
        </>
      )}
      
      {/* Indicador de salvamento */}
      {saving && (
        <div className="save-indicator show saving">
          Salvando...
        </div>
      )}
    </div>
  );
}

export default PostEditor;