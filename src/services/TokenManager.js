/**
 * TokenManager.js
 * Gerenciador centralizado para manipulação de tokens, evitando race conditions
 */

// Flag para controlar se uma operação de remoção está em andamento
let tokenRemovalInProgress = false;
// Timestamp da última remoção para evitar múltiplas remoções em sequência
let lastTokenRemoval = 0;

// Chave para armazenamento do token no localStorage
const TOKEN_KEY = 'blogcraft_token';

/**
 * Obtém o token de autenticação
 * @returns {string|null} Token de autenticação ou null
 */
const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Salva o token de autenticação
 * @param {string} token - Token de autenticação
 */
const setToken = (token) => {
  if (!token) {
    console.error('Tentativa de salvar token vazio ignorada');
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
  
  // Log para debug (remova em produção)
  console.log('Token salvo com sucesso');
};

/**
 * Remove o token de autenticação (logout)
 * Protegido contra múltiplas chamadas simultâneas
 * @param {string} source - Identificador de quem está chamando a remoção (para debug)
 * @returns {boolean} True se o token foi removido, false caso contrário
 */
const removeToken = (source = 'unknown') => {
  const currentTime = Date.now();
  
  // Se já houver uma remoção em andamento, ignorar
  if (tokenRemovalInProgress) {
    console.warn(`[TokenManager] Remoção de token ignorada: outra remoção já em andamento (Origem: ${source})`);
    return false;
  }
  
  // Se a última remoção foi há menos de 2 segundos, ignorar
  if (currentTime - lastTokenRemoval < 2000) {
    console.warn(`[TokenManager] Remoção de token ignorada: remoção recente (Origem: ${source})`);
    return false;
  }
  
  try {
    tokenRemovalInProgress = true;
    
    // Verificar se o token existe antes de remover
    const hasToken = !!localStorage.getItem(TOKEN_KEY);
    if (!hasToken) {
      console.warn(`[TokenManager] Token já não existe (Origem: ${source})`);
      return false;
    }
    
    // Remover o token
    localStorage.removeItem(TOKEN_KEY);
    console.log(`[TokenManager] Token removido com sucesso (Origem: ${source})`);
    
    // Atualizar timestamp da última remoção
    lastTokenRemoval = currentTime;
    return true;
  } finally {
    // Garantir que a flag seja resetada mesmo em caso de erro
    tokenRemovalInProgress = false;
  }
};

/**
 * Valida o token JWT
 * @param {boolean} strictMode - Se verdadeiro, aplica validação rigorosa
 * @returns {boolean} True se o token é válido
 */
const validateToken = (strictMode = false) => {
    const token = getToken();
    
    // Se não há token, não é válido
    if (!token) {
      console.log('validateToken: Nenhum token encontrado');
      return false;
    }
    
    try {
      // Verificar formato básico de JWT
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('Token com formato inválido - não tem 3 partes');
        return false;
      }
      
      // Decodificar payload
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = atob(base64);
      const payload = JSON.parse(jsonPayload);
      
      console.log('Validando token com payload:', JSON.stringify({
        sub: payload?.sub,
        exp: payload?.exp,
        aud: payload?.aud
      }));
      
      // Verificar se tem ID do usuário (sub)
      if (!payload.sub) {
        console.warn('Token não contém ID do usuário (sub)');
        return false;
      }
      
      // Verificar expiração apenas se estiver presente ou em modo estrito
      if (payload.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp <= currentTime) {
          console.warn('Token expirado');
          return false;
        }
      } else if (strictMode) {
        console.warn('Token não contém data de expiração e está em modo estrito');
        return false;
      } else {
        console.log('AVISO: Token não contém data de expiração, mas validação não está em modo estrito');
      }
      
      // IMPORTANTE: Em modo não estrito, estamos apenas verificando o formato básico
      // e a presença do ID do usuário (sub) - ideal para a validação inicial
      
      // Token válido
      console.log('Token validado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao validar token:', error);
      return false;
    }
  };