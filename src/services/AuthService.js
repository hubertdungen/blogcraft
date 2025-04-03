/**
 * AuthService - Serviço de autenticação para o BlogCraft
 * 
 * Responsável por gerenciar a autenticação com o Google OAuth
 * e validar os tokens para acesso à API do Blogger.
 */

// Chave para armazenamento do token no localStorage
const TOKEN_KEY = 'blogcraft_token';

// Escopo correto para a API do Blogger
const BLOGGER_API_SCOPE = 'https://www.googleapis.com/auth/blogger';

/**
 * Verifica se o usuário está autenticado
 * @returns {string|null} Token de autenticação ou null
 */
const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Salva o token de autenticação
 * @param {string} token - Token de autenticação
 */
const setAuthToken = (token) => {
  if (!token) {
    console.error('Tentativa de salvar token vazio');
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
  
  // Log para debug (remova em produção)
  console.log('Token salvo com sucesso');
};

/**
 * Remove o token de autenticação (logout)
 */
const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Verifica se o token é válido para a API do Blogger
 * @returns {Promise<boolean>} True se o token é válido
 */
const validateToken = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.log("Nenhum token para validar");
      return false;
    }
    
    // Verificar localmente primeiro se o token não parece expirado
    if (isTokenExpired()) {
      console.log("Token expirado localmente");
      return false;
    }
    
    // Fazer uma requisição simples para verificar a validade do token
    console.log("Fazendo requisição para validar token...");
    const response = await fetch('https://www.googleapis.com/blogger/v3/users/self/blogs', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Log para debug (remova em produção)
    console.log('Resposta API:', response.status);
    
    // Se a resposta for 401 ou 403, o token é inválido
    if (response.status === 401 || response.status === 403) {
      console.warn('Token inválido ou sem permissão:', response.status);
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
    if (!token) return null;
    
    // JWT tokens têm 3 partes separadas por pontos
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('Formato do token inválido');
      return null;
    }
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    try {
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Erro ao decodificar payload do token:', e);
      return null;
    }
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return null;
  }
};

/**
 * Obtém informações do usuário a partir do token
 * @returns {Object|null} Dados do usuário ou null
 */
const getUserInfo = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  return decodeToken(token);
};

/**
 * Verifica se o token está expirado
 * @returns {boolean} True se o token está expirado ou não existe
 */
const isTokenExpired = () => {
  const userInfo = getUserInfo();
  if (!userInfo || !userInfo.exp) {
    // Se não conseguimos extrair a data de expiração, consideramos expirado por segurança
    return true;
  }
  
  // Adicionar 5 minutos de margem para evitar problemas de sincronização
  const safetyMargin = 5 * 60; // 5 minutos em segundos
  
  // Comparar com o tempo atual (em segundos)
  const currentTime = Math.floor(Date.now() / 1000);
  const isExpired = userInfo.exp < (currentTime - safetyMargin);
  
  // Log para debug (remova em produção)
  if (isExpired) {
    console.log('Token expirado:', new Date(userInfo.exp * 1000));
    console.log('Tempo atual:', new Date(currentTime * 1000));
  }
  
  return isExpired;
};

// Exportar o serviço
const AuthService = {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  validateToken,
  decodeToken,
  getUserInfo,
  isTokenExpired,
  BLOGGER_API_SCOPE
};

export default AuthService;