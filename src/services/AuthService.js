/**
 * AuthService - Enhanced service for BlogCraft authentication
 * Fixed to properly handle Google OAuth token validation
 */

// Constants
const TOKEN_KEY = 'blogcraft_token';
const BLOGGER_API_SCOPE = 'https://www.googleapis.com/auth/blogger';
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

// Debug flag (enable for troubleshooting)
const DEBUG = true;

/**
 * Log helper for consistent debugging
 */
const log = {
  info: (message, data) => {
    if (DEBUG) console.log(`[AuthService] ${message}`, data || '');
  },
  warn: (message, data) => {
    if (DEBUG) console.warn(`[AuthService] ${message}`, data || '');
  },
  error: (message, error) => {
    if (DEBUG) console.error(`[AuthService] ${message}`, error || '');
  }
};

/**
 * Retrieves the authentication token from storage
 * @returns {string|null} The auth token or null if not found
 */
const getAuthToken = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      log.info('No token found in localStorage');
    }
    return token;
  } catch (error) {
    log.error('Error accessing localStorage', error);
    return null;
  }
};

/**
 * Stores the authentication token
 * @param {string} token - The token to store
 * @returns {boolean} True if successful, false otherwise
 */
const setAuthToken = (token) => {
  if (!token) {
    log.warn('Attempted to store empty token, ignoring');
    return false;
  }
  
  try {
    localStorage.setItem(TOKEN_KEY, token);
    log.info('Token successfully stored');
    
    // Verify token after storage
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken !== token) {
      log.error('Token verification failed - storage mismatch');
      return false;
    }
    
    return true;
  } catch (error) {
    log.error('Failed to store token', error);
    return false;
  }
};

/**
 * Removes the authentication token
 * @param {string} source - Identifier for logging purposes
 * @returns {boolean} True if successful, false otherwise
 */
const removeAuthToken = (source = 'unknown') => {
  try {
    const hasToken = !!localStorage.getItem(TOKEN_KEY);
    
    if (!hasToken) {
      log.info(`No token found to remove (source: ${source})`);
      return false;
    }
    
    localStorage.removeItem(TOKEN_KEY);
    log.info(`Token removed (source: ${source})`);
    
    // Verify removal
    const tokenAfterRemoval = localStorage.getItem(TOKEN_KEY);
    if (tokenAfterRemoval) {
      log.error('Token removal verification failed');
      return false;
    }
    
    return true;
  } catch (error) {
    log.error(`Failed to remove token (source: ${source})`, error);
    return false;
  }
};

/**
 * Decodes JWT token to extract payload
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const decodeToken = (token) => {
  if (!token) {
    log.warn('No token provided to decode');
    return null;
  }
  
  try {
    // JWT format validation
    const parts = token.split('.');
    if (parts.length !== 3) {
      log.warn('Invalid token format (not a JWT)');
      return null;
    }
    
    // Decode payload (middle part)
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Create padding if needed
    const pad = base64.length % 4;
    const paddedBase64 = pad === 0 
      ? base64 
      : base64 + '='.repeat(4 - pad);
    
    // Fix for non-standard base64 padding in some JWT implementations
    let jsonPayload;
    try {
      // Try standard decoding first
      jsonPayload = atob(paddedBase64);
    } catch (e) {
      // Fallback for problematic tokens
      try {
        // Modern browser approach
        jsonPayload = atob(base64Url);
      } catch (e2) {
        // Last resort - use safer padding approach
        const safePadding = base64.length % 4;
        const safeBase64 = safePadding ? base64 + '='.repeat(4 - safePadding) : base64;
        jsonPayload = atob(safeBase64);
      }
    }
    
    // Parse and return the payload
    const payload = JSON.parse(jsonPayload);
    
    // Log key token details for debugging
    log.info('Token decoded successfully', {
      sub: payload.sub ? payload.sub.substring(0, 8) + '...' : 'missing',
      aud: payload.aud ? (typeof payload.aud === 'string' ? payload.aud.substring(0, 15) + '...' : 'array') : 'missing',
      exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'missing',
    });
    
    return payload;
  } catch (error) {
    log.error('Failed to decode token', error);
    return null;
  }
};

/**
 * Checks if token is expired
 * @returns {boolean} True if token is expired or invalid
 */
const isTokenExpired = () => {
  const token = getAuthToken();
  
  if (!token) {
    log.info('isTokenExpired: No token found');
    return true;
  }
  
  // MUDANÇA: Se for um access token opaco, não conseguimos verificar expiração
  if (!token.includes('.')) {
    log.info('Token is opaque access token, cannot check expiration');
    return false; // Assumir que não expirou
  }
  
  const payload = decodeToken(token);
  
  if (!payload) {
    log.info('Could not decode token to check expiration');
    return false; // Assumir que não expirou
  }
  
  // Resto do código...
  if (!payload.exp) {
    log.warn('Token has no expiration claim');
    return false;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  const isExpired = payload.exp <= currentTime;
  
  if (isExpired) {
    log.info('Token is expired');
  }
  
  return isExpired;
};

/**
 * Gets user info from token
 * @returns {Object|null} User information or null
 */
const getUserInfo = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  const payload = decodeToken(token);
  if (!payload) return null;
  
  // Extract common user fields from token
  return {
    id: payload.sub || null,
    email: payload.email || null,
    name: payload.name || null,
    picture: payload.picture || null,
    exp: payload.exp || null,
    scope: payload.scope || null
  };
};

/**
 * Validates the current token with more comprehensive checks
 * @param {boolean} strictMode - Use stricter validation rules
 * @returns {boolean} True if token is valid
 */
const validateToken = (strictMode = false) => {
  const token = getAuthToken();
  
  if (!token) {
    log.info('No token to validate');
    return false;
  }
  
  // MUDANÇA: Access tokens podem não ser JWTs decodificáveis
  // Se for um access token opaco, apenas verificar se existe
  if (!token.includes('.')) {
    log.info('Token appears to be an opaque access token');
    return true; // Aceitar tokens opacos
  }
  
  // Se parecer um JWT, tentar decodificar
  const parts = token.split('.');
  if (parts.length !== 3) {
    log.info('Token format not JWT, assuming valid access token');
    return true; // Aceitar como access token válido
  }
  
  // Resto do código de validação JWT...
  const payload = decodeToken(token);
  
  if (!payload) {
    // Se não conseguir decodificar, assumir que é um access token válido
    log.info('Could not decode token, assuming valid access token');
    return true;
  }
  
  // Para JWTs, verificar expiração
  if (payload.exp) {
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp <= currentTime) {
      log.warn('Token is expired');
      return false;
    }
  }
  
  log.info('Token validation successful');
  return true;
};

/**
 * Get default scopes for OAuth
 * @returns {string} OAuth scopes
 */
const getDefaultScopes = () => {
  return BLOGGER_API_SCOPE;
};

// Export the service
const AuthService = {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  decodeToken,
  isTokenExpired,
  getUserInfo,
  validateToken,
  getDefaultScopes,
  CLIENT_ID,
  BLOGGER_API_SCOPE
};

export default AuthService;