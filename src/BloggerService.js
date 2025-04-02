/**
 * BloggerService - Serviço para comunicação com a API do Blogger
 * 
 * Encapsula todas as chamadas para a API do Blogger para facilitar
 * a integração e manutenção.
 */

/**
 * Verifica se o usuário está autenticado
 * @returns {string|null} O token de autenticação ou null se não autenticado
 */
const getAuthToken = () => {
  return localStorage.getItem('blogcraft_token');
};

/**
 * Verifica se ocorreu erro na resposta da API
 * @param {Response} response - Resposta da requisição fetch
 * @returns {Promise<any>} Dados da resposta ou erro
 */
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Se a resposta tem um objeto de erro, usá-lo
    if (data.error) {
      throw new Error(`${data.error.message || 'Erro na API'} (${response.status})`);
    }
    throw new Error(`Erro na API do Blogger: ${response.status}`);
  }
  
  return data;
};

/**
 * Obtém os blogs do usuário autenticado
 * @returns {Promise<Array>} Lista de blogs do usuário
 */
const getUserBlogs = async () => {
  const token = getAuthToken();
  if (!token) throw new Error('Usuário não autenticado');
  
  const response = await fetch('https://www.googleapis.com/blogger/v3/users/self/blogs', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return handleResponse(response);
};

/**
 * Obtém informações detalhadas de um blog específico
 * @param {string} blogId - ID do blog
 * @returns {Promise<Object>} Detalhes do blog
 */
const getBlogInfo = async (blogId) => {
  const token = getAuthToken();
  if (!token) throw new Error('Usuário não autenticado');
  
  const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return handleResponse(response);
};

/**
 * Obtém os posts de um blog
 * @param {string} blogId - ID do blog
 * @param {Object} options - Opções da requisição (maxResults, status, etc)
 * @returns {Promise<Array>} Lista de posts do blog
 */
const getPosts = async (blogId, options = {}) => {
  const token = getAuthToken();
  if (!token) throw new Error('Usuário não autenticado');
  
  // Construir query params a partir das opções
  const queryParams = new URLSearchParams();
  
  if (options.maxResults) {
    queryParams.append('maxResults', options.maxResults);
  }
  
  if (options.status) {
    queryParams.append('status', options.status);
  }
  
  if (options.startDate) {
    queryParams.append('startDate', options.startDate);
  }
  
  if (options.endDate) {
    queryParams.append('endDate', options.endDate);
  }
  
  if (options.labels) {
    queryParams.append('labels', options.labels);
  }
  
  const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts${query}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return handleResponse(response);
};

/**
 * Obtém um post específico
 * @param {string} blogId - ID do blog
 * @param {string} postId - ID do post
 * @returns {Promise<Object>} Detalhes do post
 */
const getPost = async (blogId, postId) => {
  const token = getAuthToken();
  if (!token) throw new Error('Usuário não autenticado');
  
  const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/${postId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return handleResponse(response);
};

/**
 * Cria um novo post
 * @param {string} blogId - ID do blog
 * @param {Object} postData - Dados do post (title, content, labels, etc)
 * @returns {Promise<Object>} Post criado
 */
const createPost = async (blogId, postData) => {
  const token = getAuthToken();
  if (!token) throw new Error('Usuário não autenticado');
  
  const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData)
  });
  
  return handleResponse(response);
};

/**
 * Atualiza um post existente
 * @param {string} blogId - ID do blog
 * @param {string} postId - ID do post
 * @param {Object} postData - Dados do post (title, content, labels, etc)
 * @returns {Promise<Object>} Post atualizado
 */
const updatePost = async (blogId, postId, postData) => {
  const token = getAuthToken();
  if (!token) throw new Error('Usuário não autenticado');
  
  const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/${postId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData)
  });
  
  return handleResponse(response);
};

/**
 * Publica um post
 * @param {string} blogId - ID do blog
 * @param {string} postId - ID do post
 * @returns {Promise<Object>} Post publicado
 */
const publishPost = async (blogId, postId) => {
  const token = getAuthToken();
  if (!token) throw new Error('Usuário não autenticado');
  
  const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/${postId}/publish`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return handleResponse(response);
};

/**
 * Salva um post como rascunho
 * @param {string} blogId - ID do blog
 * @param {string} postId - ID do post
 * @returns {Promise<Object>} Post salvo como rascunho
 */
const revertPostToDraft = async (blogId, postId) => {
  const token = getAuthToken();
  if (!token) throw new Error('Usuário não autenticado');
  
  const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/${postId}/revert`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return handleResponse(response);
};

/**
 * Exclui um post
 * @param {string} blogId - ID do blog
 * @param {string} postId - ID do post
 * @returns {Promise<void>}
 */
const deletePost = async (blogId, postId) => {
  const token = getAuthToken();
  if (!token) throw new Error('Usuário não autenticado');
  
  const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/${postId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  // Verificar se a resposta está ok (pode não retornar dados)
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao excluir post: ${response.status} - ${errorText}`);
  }
  
  return true;
};

/**
 * Obtém os comentários de um post
 * @param {string} blogId - ID do blog
 * @param {string} postId - ID do post
 * @returns {Promise<Array>} Lista de comentários do post
 */
const getComments = async (blogId, postId) => {
  const token = getAuthToken();
  if (!token) throw new Error('Usuário não autenticado');
  
  const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/${postId}/comments`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return handleResponse(response);
};

/**
 * Verifica se o token de autenticação é válido
 * @returns {Promise<boolean>} True se o token é válido
 */
const validateToken = async () => {
  try {
    const token = getAuthToken();
    if (!token) return false;
    
    // Tentar fazer uma requisição simples para verificar a validade do token
    const response = await fetch('https://www.googleapis.com/blogger/v3/users/self/blogs', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Erro ao validar token:', error);
    return false;
  }
};

// Exportar todas as funções como um objeto
const BloggerService = {
  getUserBlogs,
  getBlogInfo,
  getPosts,
  getPost,
  createPost,
  updatePost,
  publishPost,
  revertPostToDraft,
  deletePost,
  getComments,
  validateToken
};

export default BloggerService;