/**
 * AuthService - Enhanced service for BlogCraft authentication
 * Provides cleaner error handling and better token management
 */

// Constants
const TOKEN_KEY = 'blogcraft_token';
const BLOGGER_API_SCOPE = process.env.REACT_APP_OAUTH_SCOPE || 'https://www.googleapis.com/auth/blogger';
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

// Debug flag (disable in production)
const DEBUG = process.env.NODE_ENV !== 'production';

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
    return localStorage.getItem(TOKEN_KEY);
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
    
    // Handle browser encoding correctly
    let jsonPayload;
    try {
      // Modern browsers
      jsonPayload = atob(base64);
    } catch (e) {
      // Fallback for non-browser environments or encoding issues
      jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    }
    
    return JSON.parse(jsonPayload);
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
    return true;
  }
  
  const payload = decodeToken(token);
  
  if (!payload) {
    return true;
  }
  
  // Check for expiration
  if (!payload.exp) {
    log.warn('Token has no expiration claim');
    return false; // Being lenient here, could change to true for stricter checks
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  const isExpired = payload.exp <= currentTime;
  
  if (isExpired) {
    log.info('Token is expired', {
      expiration: new Date(payload.exp * 1000).toISOString(),
      currentTime: new Date(currentTime * 1000).toISOString()
    });
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
    exp: payload.exp || null
  };
};

/**
 * Validates the current token
 * @param {boolean} strictMode - Use stricter validation rules
 * @returns {boolean} True if token is valid
 */
const validateToken = (strictMode = false) => {
  const token = getAuthToken();
  
  if (!token) {
    log.info('No token to validate');
    return false;
  }
  
  const payload = decodeToken(token);
  
  if (!payload) {
    log.warn('Token could not be decoded');
    return false;
  }
  
  // Check essential claims
  if (!payload.sub) {
    log.warn('Token missing required "sub" claim');
    return false;
  }
  
  // Expiration check
  if (payload.exp) {
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp <= currentTime) {
      log.warn('Token is expired');
      return false;
    }
  } else if (strictMode) {
    log.warn('Token has no expiration (rejected in strict mode)');
    return false;
  }
  
  // Check scopes if in strict mode
  if (strictMode && payload.scope) {
    const hasRequiredScope = 
      payload.scope.includes('blogger') || 
      payload.scope.includes('https://www.googleapis.com/auth/blogger');
    
    if (!hasRequiredScope) {
      log.warn('Token missing required scope for Blogger API');
      return false;
    }
  }
  
  return true;
};

/**
 * Generate default scopes for OAuth
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