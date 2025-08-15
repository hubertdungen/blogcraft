import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import BloggerService from '../services/BloggerService';
import AuthService from '../services/AuthService';
import Feedback from './Feedback';

/**
 * Dashboard Component - Main application interface after login
 * 
 * Shows user's blogs, recent posts, and statistics with a clean,
 * responsive interface and robust error handling.
 */
function Dashboard() {
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stats, setStats] = useState({
    totalPosts: 0,
    draftPosts: 0,
    scheduledPosts: 0,
    postsByMonth: []
  });
  const [feedback, setFeedback] = useState(null);
  const [retryAttempts, setRetryAttempts] = useState(0);

  // Load user blogs on component mount
  useEffect(() => {
    fetchUserBlogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryAttempts]);

  // Load posts when selected blog changes
  useEffect(() => {
    if (selectedBlog) {
      fetchBlogPosts(selectedBlog.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBlog]);

  /**
   * Fetch all blogs the user has access to
   */
  const fetchUserBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setFeedback(null);
      
      // Validate token before API call
      if (!AuthService.validateToken()) {
        // Token is invalid or expired
        AuthService.removeAuthToken('Dashboard-fetchUserBlogs');
        
        navigate('/', { 
          replace: true, 
          state: { authError: 'Session expired. Please log in again.' } 
        });
        return;
      }
      
      // Fetch blogs from API
      const data = await BloggerService.getUserBlogs();
      
      if (data.items && data.items.length > 0) {
        setBlogs(data.items);
        
        // Get preferred blog from localStorage
        const savedBlogId = localStorage.getItem('blogcraft_lastBlog');
        
        // Select first blog or saved blog
        const defaultBlog = data.items.find(blog => blog.id === savedBlogId) || data.items[0];
        setSelectedBlog(defaultBlog);
      } else {
        setBlogs([]);
        setFeedback({
          type: 'warning',
          message: 'Nenhum blog encontrado. Verifique se você tem acesso a blogs no Blogger.'
        });
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      
      // Handle authentication errors
      if (
        error.message.includes('login') || 
        error.message.includes('authen') || 
        error.message.includes('token')
      ) {
        // Clear token and redirect to login
        AuthService.removeAuthToken('Dashboard-fetchUserBlogs-auth-error');
        
        navigate('/', { 
          replace: true, 
          state: { authError: error.message } 
        });
        return;
      }
      
      // Show general error message
      setFeedback({
        type: 'error',
        message: `Erro ao carregar blogs: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  /**
   * Fetch posts for the selected blog
   */
  const fetchBlogPosts = useCallback(async (blogId) => {
    try {
      setLoadingStats(true);
      
      // Save selected blog ID for future use
      localStorage.setItem('blogcraft_lastBlog', blogId);
      
      // Fetch different post types in parallel
      const [publishedData, draftData, scheduledData] = await Promise.all([
        // Published posts
        BloggerService.getPosts(blogId, { 
          status: 'live',
          maxResults: 10,
          fetchBodies: false
        }),
        
        // Draft posts
        BloggerService.getPosts(blogId, {
          status: 'draft',
          maxResults: 10,
          fetchBodies: false
        }),
        
        // Scheduled posts
        BloggerService.getPosts(blogId, {
          status: 'scheduled',
          maxResults: 10,
          fetchBodies: false
        })
      ]);
      
      // Combine and sort all posts
      const allPosts = [
        ...(publishedData.items || []).map(post => ({ ...post, status: 'LIVE' })),
        ...(draftData.items || []).map(post => ({ ...post, status: 'DRAFT' })),
        ...(scheduledData.items || []).map(post => ({ ...post, status: 'SCHEDULED' }))
      ].sort((a, b) => new Date(b.updated) - new Date(a.updated));
      
      setPosts(allPosts);
      
      // Calculate statistics
      calculateStats(
        publishedData.items || [],
        draftData.items || [],
        scheduledData.items || []
      );
    } catch (error) {
      console.error('Error fetching posts:', error);
      
      // Handle authentication errors
      if (
        error.message.includes('login') || 
        error.message.includes('authen') || 
        error.message.includes('token')
      ) {
        // Clear token and redirect to login
        AuthService.removeAuthToken('Dashboard-fetchBlogPosts-auth-error');
        
        navigate('/', { 
          replace: true, 
          state: { authError: error.message } 
        });
        return;
      }
      
      // Show error message
      setFeedback({
        type: 'error',
        message: `Erro ao carregar posts: ${error.message}`
      });
    } finally {
      setLoadingStats(false);
    }
  }, [navigate]);

  /**
   * Calculate statistics from posts data
   */
  const calculateStats = useCallback((published, drafts, scheduled) => {
    // Count posts by status
    const totalPosts = published.length;
    const draftPosts = drafts.length;
    const scheduledPosts = scheduled.length;
    
    // Group posts by month (last 6 months)
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
    
    // Count posts per month
    for (const post of published) {
      if (!post.published) continue;
      
      const publishedDate = new Date(post.published);
      const monthIndex = last6Months.findIndex(m => 
        m.month === publishedDate.getMonth() && 
        m.year === publishedDate.getFullYear()
      );
      
      if (monthIndex !== -1) {
        last6Months[monthIndex].count++;
      }
    }
    
    // Update stats state
    setStats({
      totalPosts,
      draftPosts,
      scheduledPosts,
      postsByMonth: last6Months
    });
  }, []);

  /**
   * Navigate to create new post
   */
  const handleCreateNewPost = useCallback(() => {
    if (!selectedBlog) return;
    navigate('/editor', { state: { blogId: selectedBlog.id } });
  }, [navigate, selectedBlog]);

  /**
   * Navigate to edit existing post
   */
  const handleEditPost = useCallback((postId) => {
    if (!selectedBlog) return;
    navigate(`/editor/${postId}`, { 
      state: { 
        blogId: selectedBlog.id, 
        postId 
      } 
    });
  }, [navigate, selectedBlog]);

  /**
   * Duplicate an existing post
   */
  const handleDuplicatePost = useCallback(async (postId) => {
    if (!selectedBlog) return;
    
    try {
      setFeedback({
        type: 'loading',
        message: 'Carregando post para duplicação...'
      });
      
      // Fetch the post to duplicate
      const postData = await BloggerService.getPost(selectedBlog.id, postId);
      
      // Navigate to editor with post data
      navigate('/editor', { 
        state: { 
          blogId: selectedBlog.id,
          title: `Cópia de ${postData.title}`,
          content: postData.content,
          labels: postData.labels
        } 
      });
    } catch (error) {
      console.error('Error duplicating post:', error);
      
      // Handle authentication errors
      if (
        error.message.includes('login') || 
        error.message.includes('authen') || 
        error.message.includes('token')
      ) {
        AuthService.removeAuthToken('Dashboard-duplicatePost-auth-error');
        
        navigate('/', { 
          replace: true, 
          state: { authError: error.message } 
        });
        return;
      }
      
      // Show error message
      setFeedback({
        type: 'error',
        message: `Erro ao duplicar post: ${error.message}`
      });
    }
  }, [navigate, selectedBlog]);

  /**
   * Delete a post
   */
  const handleDeletePost = useCallback(async (postId) => {
    if (!selectedBlog) return;
    
    // Confirm deletion
    if (!window.confirm('Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      setFeedback({
        type: 'loading',
        message: 'Excluindo post...'
      });
      
      // Delete the post
      await BloggerService.deletePost(selectedBlog.id, postId);
      
      // Update posts list
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      
      // Show success message
      setFeedback({
        type: 'success',
        message: 'Post excluído com sucesso!',
        duration: 3000
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      
      // Handle authentication errors
      if (
        error.message.includes('login') || 
        error.message.includes('authen') || 
        error.message.includes('token')
      ) {
        AuthService.removeAuthToken('Dashboard-deletePost-auth-error');
        
        navigate('/', { 
          replace: true, 
          state: { authError: error.message } 
        });
        return;
      }
      
      // Show error message
      setFeedback({
        type: 'error',
        message: `Erro ao excluir post: ${error.message}`
      });
    }
  }, [navigate, selectedBlog]);

  /**
   * Change selected blog
   */
  const handleChangeBlog = useCallback((e) => {
    const blogId = e.target.value;
    const blog = blogs.find(blog => blog.id === blogId);

    if (blog) {
      setSelectedBlog(blog);
    }
  }, [blogs]);

  const displayedPosts = useMemo(() => {
    const filtered =
      statusFilter === 'ALL'
        ? posts
        : posts.filter(post => post.status === statusFilter);

    return [...filtered].sort((a, b) => {
      if (sortBy === 'title') {
        return sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }

      const dateA = new Date(a.published || a.scheduled || a.updated || 0);
      const dateB = new Date(b.published || b.scheduled || b.updated || 0);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [posts, sortBy, statusFilter, sortOrder]);

  /**
   * Retry loading blogs after error
   */
  const handleRetry = useCallback(() => {
    setRetryAttempts(prev => prev + 1);
  }, []);

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  /**
   * Get status badge for post
   */
  const StatusBadge = ({ status }) => {
    let badgeClass = '';
    let text = '';
    
    switch (status) {
      case 'LIVE':
        badgeClass = 'status-badge status-live';
        text = 'Publicado';
        break;
      case 'DRAFT':
        badgeClass = 'status-badge status-draft';
        text = 'Rascunho';
        break;
      case 'SCHEDULED':
        badgeClass = 'status-badge status-scheduled';
        text = 'Agendado';
        break;
      default:
        badgeClass = 'status-badge';
        text = status || 'Desconhecido';
    }
    
    return <span className={badgeClass}>{text}</span>;
  };

  // Render empty state when no posts
  const renderEmptyState = () => (
    <div className="no-posts">
      <h3>Nenhum post encontrado</h3>
      <p>Comece criando seu primeiro post ou verifique os critérios de busca.</p>
      <button 
        className="create-button small" 
        onClick={handleCreateNewPost}
      >
        Criar Primeiro Post
      </button>
    </div>
  );

  // Render loading state
  const renderLoading = () => (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Carregando...</p>
    </div>
  );

  return (
    <div className="main-content">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        
        {blogs.length > 0 && (
          <div className="blog-selector">
            <label>Blog:</label>
            <select 
              value={selectedBlog?.id || ''} 
              onChange={handleChangeBlog}
              disabled={loading}
            >
              {blogs.map(blog => (
                <option key={blog.id} value={blog.id}>
                  {blog.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {/* Feedback component for errors, warnings, etc. */}
      {feedback && (
        <Feedback
          type={feedback.type}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      )}
      
      {loading ? (
        renderLoading()
      ) : (
        <>
          {selectedBlog && (
            <div className="dashboard-content">
              <div className="blog-info">
                <div className="blog-details">
                  <h2>{selectedBlog.name}</h2>
                  <a 
                    href={selectedBlog.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="blog-url"
                  >
                    {selectedBlog.url}
                  </a>
                </div>
                
                <button 
                  className="create-button" 
                  onClick={handleCreateNewPost}
                  disabled={loadingStats}
                >
                  Criar Novo Post
                </button>
              </div>
              
              {/* Statistics cards */}
              <div className="dashboard-stats">
                <div className="stat-card">
                  <h3>Posts Publicados</h3>
                  <div className="stat-number">
                    {loadingStats ? '...' : stats.totalPosts}
                  </div>
                </div>
                
                <div className="stat-card">
                  <h3>Rascunhos</h3>
                  <div className="stat-number">
                    {loadingStats ? '...' : stats.draftPosts}
                  </div>
                </div>
                
                <div className="stat-card">
                  <h3>Agendados</h3>
                  <div className="stat-number">
                    {loadingStats ? '...' : stats.scheduledPosts}
                  </div>
                </div>
                
                {/* Posts by month chart */}
                <div className="stat-card stat-chart">
                  <h3>Publicações por Mês</h3>
                  {loadingStats ? (
                    <div className="chart-loading">Carregando estatísticas...</div>
                  ) : (
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
                  )}
                </div>
              </div>
              
              {/* Posts list */}
              <div className="posts-section">
                <h2>Posts Recentes</h2>

                {!loadingStats && (
                  <div className="posts-controls">
                    <div className="sort-control">
                      <label>Ordenar por:</label>
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="date">Data</option>
                        <option value="title">Título</option>
                      </select>
                      <button
                        type="button"
                        className="order-toggle"
                        onClick={() =>
                          setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
                        }
                        title="Inverter ordem"
                      >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </button>
                    </div>
                    <div className="filter-control">
                      <label>Filtrar:</label>
                      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="ALL">Todos</option>
                        <option value="LIVE">Publicado</option>
                        <option value="DRAFT">Rascunho</option>
                        <option value="SCHEDULED">Agendado</option>
                      </select>
                    </div>
                  </div>
                )}

                {loadingStats ? (
                  renderLoading()
                ) : displayedPosts.length === 0 ? (
                  renderEmptyState()
                ) : (
                  <div className="posts-list">
                    {displayedPosts.map(post => (
                      <div key={post.id} className="post-item">
                        <div className="post-info">
                          <h3>{post.title}</h3>
                          <div className="post-meta">
                            <StatusBadge status={post.status} />
                            
                            <span className="post-date">
                              {post.status === 'SCHEDULED' 
                                ? `Agendado para: ${formatDate(post.scheduled || post.updated)}`
                                : post.status === 'LIVE'
                                  ? `Publicado em: ${formatDate(post.published)}`
                                  : `Atualizado em: ${formatDate(post.updated)}`
                              }
                            </span>
                            
                            {/* Tags/Labels */}
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
                        
                        {/* Post actions */}
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
          
          {!selectedBlog && !loading && (
            <div className="no-blogs-container">
              <h2>Nenhum blog encontrado</h2>
              <p>Você precisa ter acesso a pelo menos um blog no Blogger para usar este aplicativo.</p>
              <button 
                className="retry-button"
                onClick={handleRetry}
              >
                Tentar Novamente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;