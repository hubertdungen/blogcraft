/**
 * BloggerService - Enhanced service for Blogger API integration
 * 
 * Provides robust error handling, caching, and rate limiting protection
 */

import AuthService from './AuthService';

// API base URL
const API_BASE_URL = 'https://www.googleapis.com/blogger/v3';

// Debug flag (disable in production)
const DEBUG = process.env.NODE_ENV !== 'production';

// Cache configuration
const CACHE_ENABLED = true;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

// Log helper
const log = {
  info: (message, data) => {
    if (DEBUG) console.log(`[BloggerAPI] ${message}`, data || '');
  },
  warn: (message, data) => {
    if (DEBUG) console.warn(`[BloggerAPI] ${message}`, data || '');
  },
  error: (message, error) => {
    if (DEBUG) console.error(`[BloggerAPI] ${message}`, error || '');
  }
};

/**
 * Generates a cache key from request parameters
 */
const generateCacheKey = (endpoint, params) => {
  return `${endpoint}:${JSON.stringify(params || {})}`;
};

/**
 * Gets cached response if available and not expired
 */
const getCachedResponse = (key) => {
  if (!CACHE_ENABLED) return null;
  
  const cached = cache.get(key);
  if (!cached) return null;
  
  const now = Date.now();
  if (now - cached.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
};

/**
 * Caches a response with the current timestamp
 */
const cacheResponse = (key, data) => {
  if (!CACHE_ENABLED) return;
  
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

/**
 * Make an API request with proper error handling
 */
const request = async (endpoint, options = {}) => {
  // Get auth token
  const token = AuthService.getAuthToken();
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  // Check if token is expired
  if (AuthService.isTokenExpired()) {
    log.warn('Token expired, removing');
    AuthService.removeAuthToken('BloggerService-expired');
    throw new Error('Authentication expired. Please login again.');
  }
  
  // Prepare request URL and params
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Check cache for GET requests
  if (options.method === 'GET' || !options.method) {
    const cacheKey = generateCacheKey(endpoint, options.params);
    const cachedResponse = getCachedResponse(cacheKey);
    
    if (cachedResponse) {
      log.info(`Using cached response for ${endpoint}`);
      return cachedResponse;
    }
  }
  
  // Prepare query string for GET requests with params
  let queryString = '';
  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
  }
  
  // Prepare request options
  const fetchOptions = {
    method: options.method || 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      ...options.headers
    }
  };
  
  // Add body for non-GET requests
  if (options.body && fetchOptions.method !== 'GET') {
    fetchOptions.headers['Content-Type'] = 'application/json';
    fetchOptions.body = JSON.stringify(options.body);
  }
  
  // Add timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);
  fetchOptions.signal = controller.signal;
  
  try {
    log.info(`Making ${fetchOptions.method} request to ${url}${queryString}`);
    
    // Make the request
    const response = await fetch(`${url}${queryString}`, fetchOptions);
    
    // Clear timeout
    clearTimeout(timeoutId);
    
    // Handle response based on status code
    if (response.status === 204) {
      return { success: true };
    }
    
    // Get response content type
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    if (response.status === 401) {
      const data = isJson ? await response.json() : await response.text();
      log.error('Authentication error (401)', data);
      
      // Clear invalid token
      AuthService.removeAuthToken('BloggerService-401');
      
      throw new Error('Authentication failed. Please login again.');
    }
    
    if (response.status === 403) {
      const data = isJson ? await response.json() : await response.text();
      log.error('Permission error (403)', data);
      
      // Check for scope issues
      const errorMessage = isJson && data.error && data.error.message;
      if (errorMessage && (errorMessage.includes('scope') || errorMessage.includes('permission'))) {
        throw new Error('Your account does not have permission to access the Blogger API. Please check OAuth scopes.');
      }
      
      throw new Error('Access denied to the Blogger API.');
    }
    
    if (response.status === 429) {
      log.warn('Rate limit exceeded (429)');
      throw new Error('You have exceeded the API rate limit. Please try again later.');
    }
    
    // Handle general error responses
    if (!response.ok) {
      const errorData = isJson ? await response.json() : await response.text();
      log.error(`API error (${response.status})`, errorData);
      
      const errorMessage = isJson && errorData.error && errorData.error.message
        ? errorData.error.message
        : `API request failed with status ${response.status}`;
        
      throw new Error(errorMessage);
    }
    
    // Handle successful responses
    if (isJson) {
      const data = await response.json();
      
      // Cache GET responses
      if (fetchOptions.method === 'GET' || !fetchOptions.method) {
        const cacheKey = generateCacheKey(endpoint, options.params);
        cacheResponse(cacheKey, data);
      }
      
      return data;
    }
    
    return { success: true };
  } catch (error) {
    // Clear timeout
    clearTimeout(timeoutId);
    
    // Handle abort errors
    if (error.name === 'AbortError') {
      log.error('Request timeout', error);
      throw new Error('Request timed out. Please check your internet connection and try again.');
    }
    
    // Log and rethrow
    log.error(`Request failed: ${error.message}`, error);
    throw error;
  }
};

/**
 * Clears the entire cache
 */
const clearCache = () => {
  cache.clear();
  log.info('Cache cleared');
};

/**
 * Retrieves the user's blogs
 */
const getUserBlogs = async (options = {}) => {
  return request('/users/self/blogs', { ...options });
};

/**
 * Retrieves a specific blog by ID
 */
const getBlog = async (blogId, options = {}) => {
  return request(`/blogs/${blogId}`, { ...options });
};

/**
 * Retrieves posts from a blog
 */
const getPosts = async (blogId, params = {}, options = {}) => {
  return request(`/blogs/${blogId}/posts`, { 
    params,
    ...options
  });
};

/**
 * Retrieves a specific post by ID
 */
const getPost = async (blogId, postId, options = {}) => {
  return request(`/blogs/${blogId}/posts/${postId}`, { ...options });
};

/**
 * Creates a new post
 */
const createPost = async (blogId, postData, options = {}) => {
  return request(`/blogs/${blogId}/posts`, {
    method: 'POST',
    body: postData,
    ...options
  });
};

/**
 * Updates an existing post
 */
const updatePost = async (blogId, postId, postData, options = {}) => {
  return request(`/blogs/${blogId}/posts/${postId}`, {
    method: 'PUT',
    body: postData,
    ...options
  });
};

/**
 * Deletes a post
 */
const deletePost = async (blogId, postId, options = {}) => {
  return request(`/blogs/${blogId}/posts/${postId}`, {
    method: 'DELETE',
    ...options
  });
};

/**
 * Publishes a post (moves from draft to published)
 */
const publishPost = async (blogId, postId, publishDate, options = {}) => {
  let endpoint = `/blogs/${blogId}/posts/${postId}/publish`;
  
  // Add publish date if specified
  if (publishDate) {
    const params = {
      publishDate: publishDate instanceof Date 
        ? publishDate.toISOString() 
        : publishDate
    };
    return request(endpoint, { method: 'POST', params, ...options });
  }
  
  return request(endpoint, { method: 'POST', ...options });
};

/**
 * Reverts a post to draft status
 */
const revertToDraft = async (blogId, postId, options = {}) => {
  return request(`/blogs/${blogId}/posts/${postId}/revert`, {
    method: 'POST',
    ...options
  });
};

/**
 * Gets comments for a post
 */
const getComments = async (blogId, postId, params = {}, options = {}) => {
  return request(`/blogs/${blogId}/posts/${postId}/comments`, {
    params,
    ...options
  });
};

// Export the BloggerService with all methods
const BloggerService = {
  getUserBlogs,
  getBlog,
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  revertToDraft,
  getComments,
  clearCache
};

export default BloggerService;