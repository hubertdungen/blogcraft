import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import AuthService from '../services/AuthService';
import Feedback from './Feedback';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check for existing auth on mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const token = AuthService.getAuthToken();
        
        if (token && !AuthService.isTokenExpired()) {
          console.log('Valid token found, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
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
      
      // Store the token
      AuthService.setAuthToken(credentialResponse.credential);
      
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;