import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import BloggerService from '../services/BloggerService';

/**
 * Componente Dashboard - Página inicial após login
 * 
 * Exibe os blogs do usuário, posts recentes e acesso rápido
 * às principais funcionalidades da aplicação.
 */
function Dashboard({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    draftPosts: 0,
    scheduledPosts: 0,
    postsByMonth: []
  });
  const [error, setError] = useState(null);

  // Carregar blogs do usuário
  useEffect(() => {
    fetchUserBlogs();
  }, []);

  // Carregar posts quando o blog selecionado mudar
  useEffect(() => {
    if (selectedBlog) {
      fetchBlogPosts(selectedBlog);
    }
  }, [selectedBlog]);

  /**
   * Busca os blogs do usuário autenticado
   */
  const fetchUserBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await BloggerService.getUserBlogs();
      
      if (data.items && data.items.length > 0) {
        setBlogs(data.items);
        
        // Selecionar o primeiro blog por padrão ou blog salvo anteriormente
        const savedBlogId = localStorage.getItem('blogcraft_lastBlog');
        const defaultBlog = data.items.find(blog => blog.id === savedBlogId) || data.items[0];
        setSelectedBlog(defaultBlog);
      } else {
        setBlogs([]);
        setError('Nenhum blog encontrado. Verifique se você tem acesso a blogs no Blogger.');
      }
    } catch (error) {
      console.error('Erro ao buscar blogs:', error);
      setError(`Erro ao carregar blogs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Busca os posts do blog selecionado
   */
  const fetchBlogPosts = async (blog) => {
    try {
      setLoading(true);
      setError(null);
      
      // Salvar o blog selecionado para uso futuro
      localStorage.setItem('blogcraft_lastBlog', blog.id);
      
      // Buscar posts publicados
      const publishedData = await BloggerService.getPosts(blog.id, {
        maxResults: 10,
        status: 'live'
      });
      
      // Buscar posts em rascunho
      const draftData = await BloggerService.getPosts(blog.id, {
        maxResults: 10,
        status: 'draft'
      });
      
      // Buscar posts agendados
      const scheduledData = await BloggerService.getPosts(blog.id, {
        maxResults: 10,
        status: 'scheduled'
      });
      
      // Combinar todos os posts
      const allPosts = [
        ...(publishedData.items || []).map(post => ({ ...post, status: 'LIVE' })),
        ...(draftData.items || []).map(post => ({ ...post, status: 'DRAFT' })),
        ...(scheduledData.items || []).map(post => ({ ...post, status: 'SCHEDULED' }))
      ].sort((a, b) => new Date(b.updated) - new Date(a.updated));
      
      setPosts(allPosts);
      
      // Calcular estatísticas
      calculateStats(
        publishedData.items || [],
        draftData.items || [],
        scheduledData.items || []
      );
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
      setError(`Erro ao carregar posts: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calcula estatísticas baseadas nos posts
   */
  const calculateStats = (published, drafts, scheduled) => {
    // Total de posts por status
    const totalPosts = published.length;
    const draftPosts = drafts.length;
    const scheduledPosts = scheduled.length;
    
    // Agrupar posts por mês (últimos 6 meses)
    const now = new Date();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        label: month.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        count: 0,
        month: month.getMonth(),
        year: month.getFullYear()
      });
    }
    
    // Contar posts por mês
    for (const post of published) {
      const publishedDate = new Date(post.published);
      const monthIndex = last6Months.findIndex(m => 
        m.month === publishedDate.getMonth() && m.year === publishedDate.getFullYear()
      );
      
      if (monthIndex !== -1) {
        last6Months[monthIndex].count++;
      }
    }
    
    setStats({
      totalPosts,
      draftPosts,
      scheduledPosts,
      postsByMonth: last6Months
    });
  };

  /**
   * Navega para o editor para criar um novo post
   */
  const handleCreateNewPost = () => {
    navigate('/editor', { state: { blogId: selectedBlog.id } });
  };

  /**
   * Navega para o editor para editar um post existente
   */
  const handleEditPost = (postId) => {
    navigate(`/editor/${postId}`, { state: { blogId: selectedBlog.id, postId } });
  };

  /**
   * Navega para o editor para duplicar um post existente
   */
  const handleDuplicatePost = async (postId) => {
    try {
      setLoading(true);
      
      // Buscar o post original
      const postData = await BloggerService.getPost(selectedBlog.id, postId);
      
      // Navegar para o editor com os dados do post
      navigate('/editor', { 
        state: { 
          blogId: selectedBlog.id,
          title: `Cópia de ${postData.title}`,
          content: postData.content,
          labels: postData.labels
        } 
      });
    } catch (error) {
      console.error('Erro ao duplicar post:', error);
      alert(`Erro ao duplicar post: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Exclui um post após confirmação
   */
  const handleDeletePost = async (postId) => {
    if (!confirm('Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      await BloggerService.deletePost(selectedBlog.id, postId);
      
      // Remover o post da lista
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      
      alert('Post excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      alert(`Erro ao excluir post: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Muda o blog selecionado
   */
  const handleChangeBlog = (e) => {
    const blogId = e.target.value;
    const selectedBlog = blogs.find(blog => blog.id === blogId);
    
    if (selectedBlog) {
      setSelectedBlog(selectedBlog);
    }
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

  /**
   * Retorna um badge de status para o post
   */
  const getStatusBadge = (status) => {
    switch (status) {
      case 'LIVE':
        return <span className="status-badge status-live">Publicado</span>;
      case 'DRAFT':
        return <span className="status-badge status-draft">Rascunho</span>;
      case 'SCHEDULED':
        return <span className="status-badge status-scheduled">Agendado</span>;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar theme={theme} toggleTheme={toggleTheme} />
      
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          
          {blogs.length > 0 && (
            <div className="blog-selector">
              <label>Blog:</label>
              <select 
                value={selectedBlog?.id || ''} 
                onChange={handleChangeBlog}
              >
                {blogs.map(blog => (
                  <option key={blog.id} value={blog.id}>{blog.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="loading">Carregando...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            {selectedBlog && (
              <div className="dashboard-content">
                <div className="blog-info">
                  <div className="blog-details">
                    <h2>{selectedBlog.name}</h2>
                    <p className="blog-url">{selectedBlog.url}</p>
                  </div>
                  
                  <button 
                    className="create-button" 
                    onClick={handleCreateNewPost}
                  >
                    Criar Novo Post
                  </button>
                </div>
                
                <div className="dashboard-stats">
                  <div className="stat-card">
                    <h3>Posts Publicados</h3>
                    <div className="stat-number">{stats.totalPosts}</div>
                  </div>
                  
                  <div className="stat-card">
                    <h3>Rascunhos</h3>
                    <div className="stat-number">{stats.draftPosts}</div>
                  </div>
                  
                  <div className="stat-card">
                    <h3>Agendados</h3>
                    <div className="stat-number">{stats.scheduledPosts}</div>
                  </div>
                  
                  <div className="stat-card stat-chart">
                    <h3>Publicações por Mês</h3>
                    <div className="month-chart">
                      {stats.postsByMonth.map((month, index) => (
                        <div key={index} className="month-bar">
                          <div 
                            className="bar" 
                            style={{ 
                              height: `${Math.max(5, month.count * 20)}px` 
                            }}
                          >
                            <span className="bar-count">{month.count}</span>
                          </div>
                          <div className="bar-label">{month.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="posts-section">
                  <h2>Posts Recentes</h2>
                  
                  {posts.length === 0 ? (
                    <div className="no-posts">
                      <p>Nenhum post encontrado.</p>
                      <button 
                        className="create-button small" 
                        onClick={handleCreateNewPost}
                      >
                        Criar Primeiro Post
                      </button>
                    </div>
                  ) : (
                    <div className="posts-list">
                      {posts.map(post => (
                        <div key={post.id} className="post-item">
                          <div className="post-info">
                            <h3>{post.title}</h3>
                            <div className="post-meta">
                              {getStatusBadge(post.status)}
                              <span className="post-date">
                                {post.status === 'SCHEDULED' 
                                  ? `Agendado para: ${formatDate(post.scheduled || post.updated)}`
                                  : post.status === 'LIVE'
                                    ? `Publicado em: ${formatDate(post.published)}`
                                    : `Atualizado em: ${formatDate(post.updated)}`
                                }
                              </span>
                              
                              {post.labels && post.labels.length > 0 && (
                                <div className="post-labels">
                                  {post.labels.map((label, index) => (
                                    <span key={index} className="post-label">
                                      {label}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="post-actions">
                            <button 
                              className="edit-button"
                              onClick={() => handleEditPost(post.id)}
                              title="Editar este post"
                            >
                              Editar
                            </button>
                            
                            <button 
                              className="duplicate-button"
                              onClick={() => handleDuplicatePost(post.id)}
                              title="Criar uma cópia deste post"
                            >
                              Duplicar
                            </button>
                            
                            <button 
                              className="delete-button"
                              onClick={() => handleDeletePost(post.id)}
                              title="Excluir este post"
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;