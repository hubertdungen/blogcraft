import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import BloggerService from '../services/BloggerService';
import Feedback from './Feedback';

/**
 * AuthDebugger - Enhanced debugging component for authentication issues
 * 
 * This component helps diagnose common authentication problems by:
 * - Verifying token format and content
 * - Testing API connectivity
 * - Checking for proper scopes
 * - Providing detailed error information
 */
function AuthDebugger() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [tokenDetails, setTokenDetails] = useState(null);
  const [apiTestResult, setApiTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  
  // Load token information on component mount
  useEffect(() => {
    analyzeCurrentToken();
  }, []);
  
  /**
   * Analyze the current authentication token
   */
  const analyzeCurrentToken = () => {
    try {
      const currentToken = AuthService.getAuthToken();
      setToken(currentToken || '');
      
      if (!currentToken) {
        setFeedback({
          type: 'error',
          message: 'No authentication token found. You need to log in.'
        });
        return;
      }
      
      // Decode and analyze token
      const decoded = AuthService.decodeToken(currentToken);
      
      if (!decoded) {
        setFeedback({
          type: 'error',
          message: 'Token could not be decoded. It may be malformed.'
        });
        return;
      }
      
      // Check token expiration
      const isExpired = AuthService.isTokenExpired();
      
      // Check for Blogger API scope
      const hasValidScope = decoded.scope && (
        decoded.scope.includes('blogger') || 
        decoded.scope.includes('https://www.googleapis.com/auth/blogger')
      );
      
      setTokenDetails({
        ...decoded,
        isExpired,
        hasValidScope,
        tokenFirstChars: currentToken.substring(0, 15) + '...',
        tokenLength: currentToken.length
      });
      
      // Show appropriate feedback
      if (isExpired) {
        setFeedback({
          type: 'error',
          message: 'Authentication token has expired. Please log in again.'
        });
      } else if (!hasValidScope) {
        setFeedback({
          type: 'error',
          message: 'Token lacks required Blogger API permissions. Check OAuth configuration.'
        });
      } else {
        setFeedback({
          type: 'info',
          message: 'Token appears valid. Use "Test API Connection" to verify.'
        });
      }
    } catch (error) {
      console.error('Error analyzing token:', error);
      setFeedback({
        type: 'error',
        message: `Error analyzing token: ${error.message}`
      });
    }
  };
  
  /**
   * Test connection to Blogger API
   */
  const testApiConnection = async () => {
    try {
      setIsLoading(true);
      setApiTestResult(null);
      
      // Attempt to get user's blogs
      const result = await BloggerService.getUserBlogs();
      
      setApiTestResult({
        success: true,
        data: result,
        blogCount: result.items?.length || 0
      });
      
      setFeedback({
        type: 'success',
        message: `API connection successful! Found ${result.items?.length || 0} blogs.`
      });
    } catch (error) {
      console.error('API test failed:', error);
      
      setApiTestResult({
        success: false,
        error: error.message,
        errorCode: extractErrorCode(error.message)
      });
      
      setFeedback({
        type: 'error',
        message: `API connection failed: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Extract error code from error message
   */
  const extractErrorCode = (errorMessage) => {
    const codeMatches = errorMessage.match(/(\d{3})/);
    return codeMatches ? codeMatches[1] : 'unknown';
  };
  
  /**
   * Clear the current token and redirect to login
   */
  const handleClearToken = () => {
    if (window.confirm('Are you sure you want to clear the authentication token? You will need to log in again.')) {
      AuthService.removeAuthToken('AuthDebugger-manual');
      navigate('/', { replace: true });
    }
  };
  
  /**
   * Format date from timestamp
   */
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleString();
    } catch (e) {
      return `${timestamp} (Invalid format)`;
    }
  };
  
  return (
    <div className="debug-container">
      <div className="debug-header">
        <h1>Authentication Diagnostics</h1>
        <div className="debug-actions">
          <button 
            className="primary-button"
            onClick={analyzeCurrentToken}
            disabled={isLoading}
          >
            Refresh Token Analysis
          </button>
          <button 
            className="secondary-button"
            onClick={testApiConnection}
            disabled={isLoading || !token}
          >
            Test API Connection
          </button>
          <button 
            className="danger-button"
            onClick={handleClearToken}
            disabled={isLoading || !token}
          >
            Clear Token & Logout
          </button>
          <button 
            className="neutral-button"
            onClick={() => navigate('/dashboard')}
            disabled={isLoading}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
      
      {feedback && (
        <Feedback 
          type={feedback.type} 
          message={feedback.message} 
          onDismiss={() => setFeedback(null)}
        />
      )}
      
      <div className="debug-content">
        <div className="debug-section">
          <h2>Token Status</h2>
          
          {!token ? (
            <div className="debug-message error">
              No authentication token found. Please log in first.
            </div>
          ) : (
            <div className="token-info">
              <div className="info-row">
                <span className="info-label">Token Present:</span>
                <span className="info-value success">Yes</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Token Format:</span>
                <span className="info-value">
                  {tokenDetails?.tokenFirstChars || 'Invalid'}
                  <span className="token-length">
                    (Length: {tokenDetails?.tokenLength || 0} characters)
                  </span>
                </span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Token Expired:</span>
                <span className={`info-value ${tokenDetails?.isExpired ? 'error' : 'success'}`}>
                  {tokenDetails?.isExpired ? 'Yes' : 'No'}
                </span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Has Blogger Scope:</span>
                <span className={`info-value ${tokenDetails?.hasValidScope ? 'success' : 'error'}`}>
                  {tokenDetails?.hasValidScope ? 'Yes' : 'No'}
                </span>
              </div>
              
              {tokenDetails?.exp && (
                <div className="info-row">
                  <span className="info-label">Expires:</span>
                  <span className="info-value">{formatTimestamp(tokenDetails.exp)}</span>
                </div>
              )}
              
              {tokenDetails?.iat && (
                <div className="info-row">
                  <span className="info-label">Issued At:</span>
                  <span className="info-value">{formatTimestamp(tokenDetails.iat)}</span>
                </div>
              )}
              
              {tokenDetails?.email && (
                <div className="info-row">
                  <span className="info-label">Account Email:</span>
                  <span className="info-value">{tokenDetails.email}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {apiTestResult && (
          <div className="debug-section">
            <h2>API Connection Test</h2>
            
            {apiTestResult.success ? (
              <div className="api-test-success">
                <div className="debug-message success">
                  API connection successful! Found {apiTestResult.blogCount} blogs.
                </div>
                
                {apiTestResult.data?.items && apiTestResult.data.items.length > 0 && (
                  <div className="blogs-list">
                    <h3>Your Blogs:</h3>
                    <ul>
                      {apiTestResult.data.items.map(blog => (
                        <li key={blog.id} className="blog-item">
                          <strong>{blog.name}</strong>
                          <a href={blog.url} target="_blank" rel="noopener noreferrer">
                            {blog.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="api-test-error">
                <div className="debug-message error">
                  API connection failed: {apiTestResult.error}
                </div>
                
                <div className="error-explanation">
                  <h3>Error Analysis:</h3>
                  
                  {apiTestResult.errorCode === '401' && (
                    <div className="error-solution">
                      <p><strong>HTTP 401 Unauthorized</strong> - Authentication token was rejected</p>
                      <ul>
                        <li>Your token may have expired</li>
                        <li>Token may not have proper scopes/permissions</li>
                        <li>Try logging out and logging in again</li>
                      </ul>
                    </div>
                  )}
                  
                  {apiTestResult.errorCode === '403' && (
                    <div className="error-solution">
                      <p><strong>HTTP 403 Forbidden</strong> - Permission denied</p>
                      <ul>
                        <li>Your Google account may not have access to any Blogger blogs</li>
                        <li>The OAuth client may not have Blogger API access enabled</li>
                        <li>Check your Google Cloud Console project settings</li>
                      </ul>
                    </div>
                  )}
                  
                  {!['401', '403'].includes(apiTestResult.errorCode) && (
                    <div className="error-solution">
                      <p><strong>General API Error</strong></p>
                      <ul>
                        <li>Check your internet connection</li>
                        <li>Verify that the Blogger API is not experiencing downtime</li>
                        <li>Try logging out and logging in again</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="debug-section">
          <h2>OAuth Configuration</h2>
          <div className="oauth-info">
            <div className="info-row">
              <span className="info-label">Client ID:</span>
              <span className="info-value">
                {process.env.REACT_APP_GOOGLE_CLIENT_ID || 'Not set in environment (using default)'}
              </span>
            </div>
            
            <div className="info-row">
              <span className="info-label">Required Scope:</span>
              <span className="info-value">{AuthService.BLOGGER_API_SCOPE}</span>
            </div>
            
            <div className="oauth-checks">
              <h3>Common Issues Checklist:</h3>
              <ul>
                <li>☐ Client ID is correctly configured in Google Cloud Console</li>
                <li>☐ Blogger API is enabled in your Google Cloud project</li>
                <li>☐ Authorization URIs include http://localhost:3000 (for development)</li>
                <li>☐ Proper scopes are configured in OAuth consent screen</li>
                <li>☐ Your Google account has access to at least one Blogger blog</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthDebugger;