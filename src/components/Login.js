import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import AuthService from '../services/AuthService';
import Feedback from './Feedback';

/**
 * Enhanced Login component with improved error handling and debugging
 */
function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  
  // Check for existing auth on mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const token = AuthService.getAuthToken();
        
        if (token) {
          // Store the token info for debugging
          const decoded = AuthService.decodeToken(token);
          const isExpired = AuthService.isTokenExpired();
          
          setDebugInfo({
            hasToken: true,
            isExpired,
            tokenInfo: decoded ? {
              email: decoded.email || 'Not present',
              expiry: decoded.exp ? new Date(decoded.exp * 1000).toLocaleString() : 'No expiration',
              scopes: decoded.scope || 'No scopes found'
            } : 'Unable to decode token'
          });
          
          // Proceed with login if token is valid
          if (!isExpired) {
            console.log('Valid token found, redirecting to dashboard');
            navigate('/dashboard', { replace: true });
            return;
          } else {
            console.log('Expired token found, will request new login');
            // Remove the expired token
            AuthService.removeAuthToken('Login-expired');
          }
        } else {
          setDebugInfo({
            hasToken: false,
            message: 'No existing token found'
          });
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setDebugInfo({
          hasToken: false,
          error: error.message
        });
        AuthService.removeAuthToken('Login-error');
      }
    };
    
    checkExistingAuth();
    
    // Check for error message in location state (from redirects)
    if (location.state?.authError) {
      setError(`${location.state.authError}`);
    }
  }, [navigate, location.state]);
  
  /**
   * Handle successful Google login
   */
  const handleLoginSuccess = (credentialResponse) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }
      
      console.log('Received Google credential, storing token');
      
      // Store the token
      const tokenSaved = AuthService.setAuthToken(credentialResponse.credential);
      
      if (!tokenSaved) {
        throw new Error('Failed to save authentication token');
      }
      
      // Validate the token format and expiration
      const isValid = AuthService.validateToken();
      
      if (!isValid) {
        throw new Error('Received invalid token from Google');
      }
      
      // Add a slight delay for better UX
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 500);
    } catch (error) {
      console.error('Error during login process:', error);
      setError(`Authentication failed: ${error.message}`);
      setIsLoading(false);
    }
  };
  
  /**
   * Handle Google login error
   */
  const handleLoginError = (error) => {
    console.error('Google OAuth error:', error);
    setError('Authentication failed. Please check your connection and try again.');
    setIsLoading(false);
  };
  
  /**
   * Toggle debug information display
   */
  const toggleDebugInfo = () => {
    setShowDebug(prev => !prev);
  };
  
  return (
    <div className="login-container">
      <div className="login-card">
        <h1>BlogCraft</h1>
        <p>Editor Avançado para Blogger</p>
        
        {error && (
          <Feedback 
            type="error" 
            message={error} 
            onDismiss={() => setError(null)} 
          />
        )}
        
        <div className="login-form">
          {isLoading ? (
            <div className="auth-loading">Autenticando...</div>
          ) : (
            <>
              <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={handleLoginError}
                useOneTap={false}
                text="continue_with"
                theme="filled_blue"
                shape="pill"
                width="280px"
                locale="pt-BR"
                logo_alignment="center"
                scope={AuthService.BLOGGER_API_SCOPE}
              />
              
              <p className="login-note" style={{ 
                marginTop: '20px', 
                fontSize: '14px', 
                opacity: 0.8 
              }}>
                Ao fazer login, você autoriza o BlogCraft a acessar sua conta do Blogger.
                Certifique-se de que sua conta tenha acesso a blogs no Blogger.
              </p>
              
              {/* Hidden debug button (click 5 times in corner to reveal) */}
              <div className="debug-corner" onClick={toggleDebugInfo} style={{
                position: 'absolute',
                bottom: '5px',
                right: '5px',
                width: '15px',
                height: '15px',
                cursor: 'pointer'
              }}></div>
              
              {showDebug && debugInfo && (
                <div className="debug-info" style={{
                  marginTop: '20px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px',
                  textAlign: 'left',
                  backgroundColor: 'rgba(0,0,0,0.05)'
                }}>
                  <h4>Auth Debug Info:</h4>
                  <pre style={{ whiteSpace: 'pre-wrap', maxHeight: '200px', overflow: 'auto' }}>
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                  
                  <div style={{ marginTop: '10px' }}>
                    <button 
                      onClick={() => navigate('/auth-debug')}
                      style={{
                        padding: '5px 10px',
                        fontSize: '12px',
                        backgroundColor: '#333',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px'
                      }}
                    >
                      Advanced Debugging
                    </button>
                    
                    <button 
                      onClick={() => {
                        AuthService.removeAuthToken('Login-debug-clear');
                        window.location.reload();
                      }}
                      style={{
                        padding: '5px 10px',
                        fontSize: '12px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        marginLeft: '10px'
                      }}
                    >
                      Clear Auth Data
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;