/**
 * AuthService - Serviço de autenticação para o BlogCraft
 * 
 * Responsável por gerenciar a autenticação com o Google OAuth
 * e validar os tokens para acesso à API do Blogger.
 */

// Escopo correto para a API do Blogger
const BLOGGER_API_SCOPE = 'https://www.googleapis.com/auth/blogger';

/**
 * Verifica se o usuário está autenticado
 * @returns {string|null} Token de autenticação ou null
 */
const getAuthToken = () => {
  return localStorage.getItem('blogcraft_token');
};

/**
 * Salva o token de autenticação
 * @param {string} token - Token de autenticação
 */
const setAuthToken = (token) => {
  localStorage.setItem('blogcraft_token', token);
};

/**
 * Remove o token de autenticação (logout)
 */
const removeAuthToken = () => {
  localStorage.removeItem('blogcraft_token');
};

/**
 * Verifica se o token é válido para a API do Blogger
 * @returns {Promise<boolean>} True se o token é válido
 */
const validateToken = async () => {
  try {
    const token = getAuthToken();
    if (!token) return false;
    
    // Fazer uma requisição simples para verificar a validade do token
    const response = await fetch('https://www.googleapis.com/blogger/v3/users/self/blogs', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Se a resposta for 401 ou 403, o token é inválido
    if (response.status === 401 || response.status === 403) {
      console.error('Token inválido ou sem permissão:', await response.json());
      return false;
    }
    
    return response.ok;
  } catch (error) {
    console.error('Erro ao validar token:', error);
    return false;
  }
};

/**
 * Decodifica o token JWT para obter informações do usuário
 * @param {string} token - Token JWT
 * @returns {Object|null} Dados do usuário ou null em caso de erro
 */
const decodeToken = (token) => {
  try {
    // JWT tokens têm 3 partes separadas por pontos
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return null;
  }
};

// Exportar o serviço
const AuthService = {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  validateToken,
  decodeToken,
  BLOGGER_API_SCOPE
};

export default AuthService;