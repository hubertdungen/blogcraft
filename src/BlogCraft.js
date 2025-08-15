import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import DateTimePicker from 'react-datetime-picker';
import { GoogleLogin } from '@react-oauth/google';
import { saveAs } from 'file-saver';
import './App.css';
import logo from './logo.svg';

// Componente principal da aplicação
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
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/editor" element={<PostEditor theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/editor/:postId" element={<PostEditor theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/templates" element={<Templates theme={theme} toggleTheme={toggleTheme} />} />
          <Route path="/settings" element={<Settings theme={theme} toggleTheme={toggleTheme} />} />
        </Routes>
      </div>
    </Router>
  );
}

// Componente de Login
function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleLoginSuccess = (credentialResponse) => {
    // Autenticar com a API do Blogger usando o token do Google
    const token = credentialResponse.credential;
    localStorage.setItem('blogcraft_token', token);
    
    // Redirecionar para o dashboard após login bem-sucedido
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>
          <img src={logo} alt="BlogCraft logo" className="logo-icon" />
          BlogCraft
        </h1>
        <p>Editor Avançado para Blogger</p>
        
        <div className="login-form">
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => setError('Falha na autenticação')}
            shape="pill"
            text="continue_with"
            theme="filled_blue"
            useOneTap
            scope="https://www.googleapis.com/auth/blogger"
          />
          
          {error && <p className="error-message">{error}</p>}
        </div>
      </div>
    </div>
  );
}

// Componente do Dashboard
function Dashboard({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carregar blogs do usuário
    fetchUserBlogs();
  }, []);

  useEffect(() => {
    if (selectedBlog) {
      fetchPosts(selectedBlog);
    }
  }, [selectedBlog]);

  const fetchUserBlogs = async () => {
    try {
      const token = localStorage.getItem('blogcraft_token');
      // Chamada para a API do Blogger para obter os blogs
      const response = await fetch('https://www.googleapis.com/blogger/v3/users/self/blogs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        setBlogs(data.items);
        setSelectedBlog(data.items[0].id);
      }
    } catch (error) {
      console.error('Erro ao buscar blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (blogId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('blogcraft_token');
      
      // Chamada para a API do Blogger para obter os posts
      const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.items) {
        setPosts(data.items);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewPost = () => {
    navigate('/editor', { state: { blogId: selectedBlog } });
  };

  const handleEditPost = (postId) => {
    navigate(`/editor/${postId}`, { state: { blogId: selectedBlog, postId } });
  };

  const handleDuplicatePost = async (postId) => {
    try {
      const token = localStorage.getItem('blogcraft_token');
      
      // Buscar o post original
      const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${selectedBlog}/posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const postData = await response.json();
      
      // Navegar para o editor com os dados do post
      navigate('/editor', { 
        state: { 
          blogId: selectedBlog,
          title: `Cópia de ${postData.title}`,
          content: postData.content,
          labels: postData.labels
        } 
      });
    } catch (error) {
      console.error('Erro ao duplicar post:', error);
    }
  };

  const handleChangeBlog = (e) => {
    setSelectedBlog(e.target.value);
  };

  return (
    <div className="dashboard-container">
      <Sidebar theme={theme} toggleTheme={toggleTheme} />
      
      <div className="main-content">
        <h1>Dashboard</h1>
        
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : (
          <>
            <div className="blog-selector">
              <label>Selecionar Blog:</label>
              <select value={selectedBlog || ''} onChange={handleChangeBlog}>
                {blogs.map(blog => (
                  <option key={blog.id} value={blog.id}>{blog.name}</option>
                ))}
              </select>
            </div>
            
            <button className="create-button" onClick={handleCreateNewPost}>
              Criar Novo Post
            </button>
            
            <div className="posts-list">
              <h2>Posts Recentes</h2>
              
              {posts.length === 0 ? (
                <p>Nenhum post encontrado.</p>
              ) : (
                posts.map(post => (
                  <div key={post.id} className="post-item">
                    <h3>{post.title}</h3>
                    <p>{new Date(post.published).toLocaleString()}</p>
                    <div className="post-actions">
                      <button onClick={() => handleEditPost(post.id)}>Editar</button>
                      <button onClick={() => handleDuplicatePost(post.id)}>Duplicar</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Componente do Editor de Posts
function PostEditor({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    labels: [],
    isDraft: true,
    scheduledPublish: null
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [metadata, setMetadata] = useState({
    description: '',
    author: '',
    keywords: ''
  });
  const [showMetadataEditor, setShowMetadataEditor] = useState(false);

  useEffect(() => {
    // Carregar templates salvos
    const savedTemplates = JSON.parse(localStorage.getItem('blogcraft_templates') || '[]');
    setTemplates(savedTemplates);
    
    // Verificar se estamos editando um post existente
    const fetchPostIfNeeded = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const postId = urlParams.get('postId');
      const blogId = urlParams.get('blogId');
      
      if (postId && blogId) {
        await fetchPost(blogId, postId);
      }
    };
    
    fetchPostIfNeeded();
  }, []);

  const fetchPost = async (blogId, postId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('blogcraft_token');
      
      // Buscar o post existente
      const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
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
    } finally {
      setLoading(false);
    }
  };

  const extractMetadata = (content, metaType) => {
    if (!content) return '';
    
    const metaRegex = new RegExp(`<meta name="${metaType}" content="([^"]*)"`, 'i');
    const match = content.match(metaRegex);
    
    return match ? match[1] : '';
  };

  const handleEditorChange = (content) => {
    setPostData(prev => ({
      ...prev,
      content
    }));
  };

  const handleTitleChange = (e) => {
    setPostData(prev => ({
      ...prev,
      title: e.target.value
    }));
  };

  const handleLabelsChange = (e) => {
    const labels = e.target.value.split(',').map(label => label.trim());
    setPostData(prev => ({
      ...prev,
      labels
    }));
  };

  const handleScheduleChange = (date) => {
    setPostData(prev => ({
      ...prev,
      scheduledPublish: date
    }));
  };

  const handleDraftToggle = () => {
    setPostData(prev => ({
      ...prev,
      isDraft: !prev.isDraft
    }));
  };

  const handleMetadataChange = (e, field) => {
    setMetadata(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSaveTemplate = () => {
    const templateName = prompt('Nome do template:');
    
    if (templateName) {
      const newTemplate = {
        id: Date.now(),
        name: templateName,
        content: postData.content
      };
      
      const updatedTemplates = [...templates, newTemplate];
      setTemplates(updatedTemplates);
      localStorage.setItem('blogcraft_templates', JSON.stringify(updatedTemplates));
      
      alert('Template salvo com sucesso!');
    }
  };

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
    }
  };

  const handleSavePost = async (publish = false) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('blogcraft_token');
      const urlParams = new URLSearchParams(window.location.search);
      const postId = urlParams.get('postId');
      const blogId = urlParams.get('blogId');
      
      if (!blogId) {
        alert('ID do blog não encontrado');
        return;
      }
      
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
      
      // Determinar se estamos criando ou atualizando um post
      const method = postId ? 'PUT' : 'POST';
      const url = postId 
        ? `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/${postId}`
        : `https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postPayload)
      });
      
      if (!response.ok) {
        throw new Error('Erro ao salvar post');
      }
      
      const savedPost = await response.json();
      
      if (publish && !postData.scheduledPublish) {
        // Publicar imediatamente se não estiver agendado
        await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/${savedPost.id}/publish`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      alert(publish ? 'Post publicado com sucesso!' : 'Rascunho salvo com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      alert('Ocorreu um erro ao salvar o post.');
    } finally {
      setSaving(false);
    }
  };

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

  const handleSaveAsDraft = () => {
    handleSavePost(false);
  };

  const handlePublish = () => {
    handleSavePost(true);
  };

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
        const parser = new DOMParser();
        const doc = parser.parseFromString(fileContent, 'text/html');
        
        // Tentar obter o título
        const titleElement = doc.querySelector('title') || doc.querySelector('h1');
        title = titleElement ? titleElement.textContent : '';
        
        // Obter o conteúdo do body
        const bodyElement = doc.querySelector('body');
        content = bodyElement ? bodyElement.innerHTML : fileContent;
      }
      
      setPostData(prev => ({
        ...prev,
        title: title || prev.title,
        content: content || prev.content
      }));
    };
    
    if (file.name.endsWith('.txt') || file.name.endsWith('.html')) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="editor-container">
      <Sidebar theme={theme} toggleTheme={toggleTheme} />
      
      <div className="editor-content">
        <div className="editor-header">
          <h1>Editor de Post</h1>
          
          <div className="editor-actions">
            <button 
              className="save-draft-button" 
              onClick={handleSaveAsDraft}
              disabled={saving}
            >
              Salvar Rascunho
            </button>
            
            <button 
              className="publish-button" 
              onClick={handlePublish}
              disabled={saving}
            >
              {postData.scheduledPublish ? 'Agendar' : 'Publicar'}
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : (
          <>
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
                  />
                </div>
                
                <div className="template-select">
                  <label>Template:</label>
                  <select onChange={handleTemplateSelect} value={selectedTemplate?.id || 0}>
                    <option value={0}>Nenhum</option>
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
                    <label>Descrição:</label>
                    <input
                      type="text"
                      value={metadata.description}
                      onChange={(e) => handleMetadataChange(e, 'description')}
                    />
                  </div>
                  
                  <div className="metadata-field">
                    <label>Autor:</label>
                    <input
                      type="text"
                      value={metadata.author}
                      onChange={(e) => handleMetadataChange(e, 'author')}
                    />
                  </div>
                  
                  <div className="metadata-field">
                    <label>Palavras-chave:</label>
                    <input
                      type="text"
                      value={metadata.keywords}
                      onChange={(e) => handleMetadataChange(e, 'keywords')}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="rich-editor">
              <Editor
                apiKey={process.env.REACT_APP_TINYMCE_API_KEY} // Substituir pela sua chave da TinyMCE
                onInit={(evt, editor) => editorRef.current = editor}
                value={postData.content}
                onEditorChange={handleEditorChange}
                init={{
                  height: 500,
                  menubar: true,
                  plugins: [
                    'advlist autolink lists link image charmap print preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table paste code help wordcount'
                  ],
                  toolbar: 'undo redo | formatselect | ' +
                    'bold italic backcolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help | image | code',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                  skin: theme === 'dark' ? 'oxide-dark' : 'oxide',
                  content_css: theme === 'dark' ? 'dark' : 'default'
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Componente de Templates
function Templates({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const editorRef = useRef(null);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    // Carregar templates
    const savedTemplates = JSON.parse(localStorage.getItem('blogcraft_templates') || '[]');
    setTemplates(savedTemplates);
  }, []);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setTemplateName(template.name);
  };

  const handleCreateTemplate = () => {
    setSelectedTemplate({
      id: Date.now(),
      name: 'Novo Template',
      content: ''
    });
    setTemplateName('Novo Template');
  };

  const handleDeleteTemplate = (templateId) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;
    
    const updatedTemplates = templates.filter(template => template.id !== templateId);
    setTemplates(updatedTemplates);
    localStorage.setItem('blogcraft_templates', JSON.stringify(updatedTemplates));
    
    if (selectedTemplate && selectedTemplate.id === templateId) {
      setSelectedTemplate(null);
      setTemplateName('');
    }
  };

  const handleSaveTemplate = () => {
    if (!selectedTemplate) return;
    
    const updatedTemplate = {
      ...selectedTemplate,
      name: templateName,
      content: editorRef.current ? editorRef.current.getContent() : selectedTemplate.content
    };
    
    let updatedTemplates;
    
    if (templates.some(t => t.id === selectedTemplate.id)) {
      // Atualizar template existente
      updatedTemplates = templates.map(t => 
        t.id === selectedTemplate.id ? updatedTemplate : t
      );
    } else {
      // Adicionar novo template
      updatedTemplates = [...templates, updatedTemplate];
    }
    
    setTemplates(updatedTemplates);
    localStorage.setItem('blogcraft_templates', JSON.stringify(updatedTemplates));
    
    alert('Template salvo com sucesso!');
  };

  const handleNameChange = (e) => {
    setTemplateName(e.target.value);
  };

  const handleEditorChange = (content) => {
    setSelectedTemplate(prev => ({
      ...prev,
      content
    }));
  };

  return (
    <div className="templates-container">
      <Sidebar theme={theme} toggleTheme={toggleTheme} />
      
      <div className="templates-content">
        <h1>Gerenciar Templates</h1>
        
        <div className="templates-layout">
          <div className="templates-list">
            <button className="create-template-button" onClick={handleCreateTemplate}>
              Criar Novo Template
            </button>
            
            {templates.length === 0 ? (
              <p>Nenhum template salvo.</p>
            ) : (
              templates.map(template => (
                <div 
                  key={template.id} 
                  className={`template-item ${selectedTemplate && selectedTemplate.id === template.id ? 'selected' : ''}`}
                  onClick={() => handleSelectTemplate(template)}
                >
                  <h3>{template.name}</h3>
                  <button 
                    className="delete-template-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(template.id);
                    }}
                  >
                    Excluir
                  </button>
                </div>
              ))
            )}
          </div>
          
          {selectedTemplate && (
            <div className="template-editor">
              <div className="template-name-input">
                <label>Nome do Template:</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={handleNameChange}
                />
              </div>
              
              <Editor
                apiKey={process.env.REACT_APP_TINYMCE_API_KEY} // Substituir pela sua chave da TinyMCE
                onInit={(evt, editor) => editorRef.current = editor}
                initialValue={selectedTemplate.content}
                onEditorChange={handleEditorChange}
                init={{
                  height: 500,
                  menubar: true,
                  plugins: [
                    'advlist autolink lists link image charmap print preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table paste code help wordcount'
                  ],
                  toolbar: 'undo redo | formatselect | ' +
                    'bold italic backcolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help | image | code',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                  skin: theme === 'dark' ? 'oxide-dark' : 'oxide',
                  content_css: theme === 'dark' ? 'dark' : 'default'
                }}
              />
              
              <button className="save-template-button" onClick={handleSaveTemplate}>
                Salvar Template
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente de Configurações
function Settings({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    defaultBlogId: '',
    defaultTemplate: '',
    autoSaveInterval: 5,
    autoBackup: true
  });
  const [blogs, setBlogs] = useState([]);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    // Carregar configurações
    const savedSettings = JSON.parse(localStorage.getItem('blogcraft_settings') || '{}');
    setSettings({
      defaultBlogId: savedSettings.defaultBlogId || '',
      defaultTemplate: savedSettings.defaultTemplate || '',
      autoSaveInterval: savedSettings.autoSaveInterval || 5,
      autoBackup: savedSettings.autoBackup !== undefined ? savedSettings.autoBackup : true
    });
    
    // Carregar blogs
    fetchUserBlogs();
    
    // Carregar templates
    const savedTemplates = JSON.parse(localStorage.getItem('blogcraft_templates') || '[]');
    setTemplates(savedTemplates);
  }, []);

  const fetchUserBlogs = async () => {
    try {
      const token = localStorage.getItem('blogcraft_token');
      
      if (!token) {
        navigate('/');
        return;
      }
      
      // Chamada para a API do Blogger para obter os blogs
      const response = await fetch('https://www.googleapis.com/blogger/v3/users/self/blogs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.items) {
        setBlogs(data.items);
      }
    } catch (error) {
      console.error('Erro ao buscar blogs:', error);
    }
  };

  const handleSettingChange = (e, setting) => {
    const value = setting === 'autoBackup' 
      ? e.target.checked 
      : setting === 'autoSaveInterval'
        ? parseInt(e.target.value)
        : e.target.value;
    
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSaveSettings = () => {
    localStorage.setItem('blogcraft_settings', JSON.stringify(settings));
    alert('Configurações salvas com sucesso!');
  };

  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair? Seus dados locais serão mantidos.')) {
      localStorage.removeItem('blogcraft_token');
      navigate('/');
    }
  };

  return (
    <div className="settings-container">
      <Sidebar theme={theme} toggleTheme={toggleTheme} />
      
      <div className="settings-content">
        <h1>Configurações</h1>
        
        <div className="settings-form">
          <div className="setting-group">
            <h2>Preferências</h2>
            
            <div className="setting-item">
              <label>Blog Padrão:</label>
              <select
                value={settings.defaultBlogId}
                onChange={(e) => handleSettingChange(e, 'defaultBlogId')}
              >
                <option value="">Selecionar...</option>
                {blogs.map(blog => (
                  <option key={blog.id} value={blog.id}>{blog.name}</option>
                ))}
              </select>
            </div>
            
            <div className="setting-item">
              <label>Template Padrão:</label>
              <select
                value={settings.defaultTemplate}
                onChange={(e) => handleSettingChange(e, 'defaultTemplate')}
              >
                <option value="">Nenhum</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
            </div>
            
            <div className="setting-item">
              <label>Intervalo de Salvamento Automático (minutos):</label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.autoSaveInterval}
                onChange={(e) => handleSettingChange(e, 'autoSaveInterval')}
              />
            </div>
            
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={(e) => handleSettingChange(e, 'autoBackup')}
                />
                Backup Automático de Rascunhos
              </label>
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
      </div>
    </div>
  );
}

// Componente da Barra Lateral
function Sidebar({ theme, toggleTheme }) {
  return (
    <div className="sidebar">
      <div className="logo">
        <h2>
          <img src={logo} alt="BlogCraft logo" className="logo-icon" />
          BlogCraft
        </h2>
      </div>
      
      <nav className="nav-menu">
        <Link to="/dashboard" className="nav-item">
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
    </div>
  );
}

// Renderizar o aplicativo
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

export default App;