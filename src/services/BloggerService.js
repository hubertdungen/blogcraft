/**
 * BloggerService - Serviço para comunicação com a API do Blogger
 * 
 * Encapsula todas as chamadas para a API do Blogger para facilitar
 * a integração e manutenção.
 */

import AuthService from './AuthService';

/**
 * Verifica se ocorreu erro na resposta da API
 * @param {Response} response - Resposta da requisição fetch
 * @returns {Promise<any>} Dados da resposta ou erro
 */
const handleResponse = async (response) => {
  // Para respostas que não têm conteúdo (como DELETE)
  if (response.status === 204) {
    return { success: true };
  }
  
  const contentType = response.headers.get('content-type');
  
  // Se a resposta é JSON
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    
    if (!response.ok) {
      // Se a resposta tem um objeto de erro, usá-lo
      if (data.error) {
        throw new Error(`${data.error.message || 'Erro na API'} (${response.status})`);
      }
      throw new Error(`Erro na API do Blogger: ${response.status}`);
    }
    
    return data;
  }
  
  // Para outros tipos de conteúdo
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erro na API do Blogger: ${response.status} - ${text}`);
  }
  
  return { success: true };
};

/**
 * Pega o token de autenticação atual e verifica se é válido
 * @returns {string} Token de autenticação
 * @throws {Error} Se não houver token válido
 */
const getValidToken = () => {
  const token = AuthService.getAuthToken();
  if (!token) {
    throw new Error('Usuário não autenticado');
  }
  
  // Verificar se o token está expirado
  if (AuthService.isTokenExpired()) {
    throw new Error('Token expirado. Por favor, faça login novamente.');
  }
  
  return token;
};

/**
 * Obtém os blogs do usuário autenticado
 * @returns {Promise<Array>} Lista de blogs do usuário
 */
const getUserBlogs = async () => {
  try {
    const token = getValidToken();
    
    console.log('Buscando blogs do usuário...');
    const response = await fetch('https://www.googleapis.com/blogger/v3/users/self/blogs', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Resposta status:', response.status);
    
    if (response.status === 401 || response.status === 403) {
      // Token inválido ou sem permissão, tentar obter detalhes do erro
      try {
        const errorData = await response.json();
        console.error('Erro de autenticação:', errorData);
        
        // Se for erro de token expirado, limpar token para forçar novo login
        if (errorData.error && 
            (errorData.error.status === 'UNAUTHENTICATED' || 
             errorData.error.status === 'PERMISSION_DENIED' ||
             errorData.error.message.includes('Invalid Credentials'))) {
          console.log('Token inválido detectado, limpando...');
          AuthService.removeAuthToken();
        }
      } catch (e) {
        console.error('Erro ao processar resposta de erro:', e);
      }
      
      throw new Error('Erro de autenticação. Por favor, faça login novamente.');
    }
    
    return handleResponse(response);
  } catch (error) {
    console.error('Erro ao buscar blogs:', error);
    
    // Se for erro relacionado a autenticação, limpar token
    if (error.message.includes('autenticado') || 
        error.message.includes('token') || 
        error.message.includes('login')) {
      AuthService.removeAuthToken();
    }
    
    throw error;
  }
};

/**
 * Obtém informações detalhadas de um blog específico
 * @param {string} blogId - ID do blog
 * @returns {Promise<Object>} Detalhes do blog
 */
const getBlogInfo = async (blogId) => {
  try {
    const token = getValidToken();
    
    const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Erro ao buscar informações do blog:', error);
    throw error;
  }
};

/**
 * Obtém os posts de um blog
 * @param {string} blogId - ID do blog
 * @param {Object} options - Opções da requisição (maxResults, status, etc)
 * @returns {Promise<Array>} Lista de posts do blog
 */
const getPosts = async (blogId, options = {}) => {
  try {
    const token = getValidToken();
    
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
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    throw error;
  }
};

/**
 * Obtém um post específico
 * @param {string} blogId - ID do blog
 * @param {string} postId - ID do post
 * @returns {Promise<Object>} Detalhes do post
 */
const getPost = async (blogId, postId) => {
  try {
    const token = getValidToken();
    
    const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/${postId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Erro ao buscar post:', error);
    throw error;
  }
};

/**
 * Cria um novo post
 * @param {string} blogId - ID do blog
 * @param {Object} postData - Dados do post (title, content, labels, etc)
 * @returns {Promise<Object>} Post criado
 */
const createPost = async (blogId, postData) => {
  try {
    const token = getValidToken();
    
    const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Erro ao criar post:', error);
    throw error;
  }
};

/**
 * Atualiza um post existente
 * @param {string} blogId - ID do blog
 * @param {string} postId - ID do post
 * @param {Object} postData - Dados do post (title, content, labels, etc)
 * @returns {Promise<Object>} Post atualizado
 */
const updatePost = async (blogId, postId, postData) => {
  try {
    const token = getValidToken();
    
    const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Erro ao atualizar post:', error);
    throw error;
  }
};

/**
 * Publica um post
 * @param {string} blogId - ID do blog
 * @param {string} postId - ID do post
 * @returns {Promise<Object>} Post publicado
 */
const publishPost = async (blogId, postId) => {
  try {
    const token = getValidToken();
    
    const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/${postId}/publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Erro ao publicar post:', error);
    throw error;
  }
};

/**
 * Salva um post como rascunho
 * @param {string} blogId - ID do blog
 * @param {string} postId - ID do post
 * @returns {Promise<Object>} Post salvo como rascunho
 */
const revertPostToDraft = async (blogId, postId) => {
  try {
    const token = getValidToken();
    
    const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/${postId}/revert`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Erro ao reverter post para rascunho:', error);
    throw error;
  }
};

/**
 * Exclui um post
 * @param {string} blogId - ID do blog
 * @param {string} postId - ID do post
 * @returns {Promise<void>}
 */
const deletePost = async (blogId, postId) => {
  try {
    const token = getValidToken();
    
    const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Erro ao excluir post:', error);
    throw error;
  }
};

/**
 * Obtém os comentários de um post
 * @param {string} blogId - ID do blog
 * @param {string} postId - ID do post
 * @returns {Promise<Array>} Lista de comentários do post
 */
const getComments = async (blogId, postId) => {
  try {
    const token = getValidToken();
    
    const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/${postId}/comments`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    throw error;
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
  getComments
};

export default BloggerService;