import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import AuthService from '../services/AuthService';
import Feedback from './Feedback';

/**
 * Enhanced Login Component
 * 
 * Provides robust Google OAuth integration with improved error handling
 * and better user feedback during the authentication process.
 */
function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clientIdValid, setClientIdValid] = useState(false);
  
  // Determine where to redirect after successful login
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Check environment setup and existing auth on mount
  useEffect(() => {
    const checkEnvironment = () => {
      // Check if client ID is configured
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      if (!clientId) {
        setError('Google Client ID is not configured. Please check your .env file.');
        setClientIdValid(false);
        return;
      }
      
      // Simple validation of client ID format
      if (!clientId.includes('.apps.googleusercontent.com')) {
        setError('Google Client ID appears to be invalid. Please check your configuration.');
        setClientIdValid(false);
        return;
      }
      
      setClientIdValid(true);
    };
    
    const checkExistingAuth = async () => {
      try {
        const token = AuthService.getAuthToken();
        
        if (token) {
          // Check if token is valid
          if (!AuthService.isTokenExpired()) {
            console.log('Valid token found, redirecting to dashboard');
            navigate(from, { replace: true });
            return;
          } else {
            console.log('Expired token found, removing it');
            AuthService.removeAuthToken('Login-expired');
          }
        }
      } catch (error) {
        console.error('Error checking existing authentication:', error);
        AuthService.removeAuthToken('Login-error');
      }
    };
    
    // Run checks
    checkEnvironment();
    checkExistingAuth();
    
    // Check for error message in location state (from redirects)
    if (location.state?.authError) {
      setError(`${location.state.authError}`);
    }
  }, [navigate, from, location.state]);
  
  /**
   * Handle successful Google login
   */
  const handleLoginSuccess = (credentialResponse) => {
    setIsLoading(true);
    setError(null);
    
    console.log('Login successful, processing credentials...');
    
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }
      
      // Decode token to verify format
      const tokenData = AuthService.decodeToken(credentialResponse.credential);
      
      if (!tokenData) {
        throw new Error('Received token is invalid or could not be decoded');
      }
      
      console.log('Token validated, storing credentials...');
      
      // Store the token
      AuthService.setAuthToken(credentialResponse.credential);
      
      // Add a slight delay for better UX
      setTimeout(() => {
        navigate(from, { replace: true });
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
          ) : !clientIdValid ? (
            <div className="configuration-error">
              <p>A configuração de OAuth está incompleta.</p>
              <p>Verifique o arquivo .env com as variáveis de ambiente necessárias.</p>
              
              <details style={{ marginTop: '20px', cursor: 'pointer' }}>
                <summary>Informações para Desenvolvedores</summary>
                <div style={{ 
                  marginTop: '10px', 
                  fontSize: '14px', 
                  padding: '10px', 
                  background: 'rgba(0,0,0,0.05)', 
                  borderRadius: '4px' 
                }}>
                  <p>O aplicativo está procurando por:</p>
                  <code>REACT_APP_GOOGLE_CLIENT_ID</code>
                  <p>Atual: {process.env.REACT_APP_GOOGLE_CLIENT_ID || 'não definido'}</p>
                  
                  <p style={{ marginTop: '10px' }}>Também verifique:</p>
                  <code>REACT_APP_OAUTH_SCOPE</code>
                  <p>Atual: {process.env.REACT_APP_OAUTH_SCOPE || 'https://www.googleapis.com/auth/blogger'}</p>
                </div>
              </details>
            </div>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;