import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';  // MUDANÇA AQUI
import AuthService from '../services/AuthService';
import Feedback from './Feedback';
import logo from '../logo.svg';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing token on mount
  useEffect(() => {
    const token = AuthService.getAuthToken();
    if (token && !AuthService.isTokenExpired()) {
      console.log('Valid token found, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
    if (location.state?.authError) {
      setError(`${location.state.authError}`);
    }
  }, [navigate, location.state]);

  // MUDANÇA PRINCIPAL: Usar useGoogleLogin ao invés de GoogleLogin
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError(null);
      
      try {
        // IMPORTANTE: Usar tokenResponse.access_token, não credential
        console.log('Received token response', tokenResponse);
        const tokenSaved = AuthService.setAuthToken(tokenResponse.access_token);
        
        if (!tokenSaved) {
          throw new Error('Failed to save authentication token');
        }
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 500);
      } catch (err) {
        console.error('Error during login process:', err);
        setError(`Authentication failed: ${err.message}`);
        setIsLoading(false);
      }
    },
    onError: (err) => {
      console.error('Google OAuth error:', err);
      setError('Authentication failed. Please check your connection and try again.');
      setIsLoading(false);
    },
    scope: 'https://www.googleapis.com/auth/blogger',  // IMPORTANTE: Definir o scope
  });

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>
          <img src={logo} alt="BlogCraft logo" className="logo-icon" />
          BlogCraft
        </h1>
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
            <button 
              onClick={() => login()}
              className="google-login-button"
              style={{
                padding: '10px 20px',
                backgroundColor: '#4285f4',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google" 
                style={{ width: '20px', height: '20px' }}
              />
              Continuar com o Google
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;