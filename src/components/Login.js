import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import AuthService from '../services/AuthService';
import Feedback from './Feedback';

/**
 * Componente de Login
 * 
 * Gerencia a autenticação do usuário com o Google OAuth
 * e redireciona para o Dashboard após sucesso.
 */
function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  
  // Destino após o login (se redirecionado de outra página)
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Verificar se já está autenticado
  useEffect(() => {
    const checkExistingAuth = async () => {
      const token = AuthService.getAuthToken();
      
      if (token) {
        try {
          // Verificar se o token é válido localmente
          const decodedToken = AuthService.decodeToken(token);
          
          if (!decodedToken) {
            console.log('Token inválido encontrado, removendo...');
            AuthService.removeAuthToken();
            return;
          }
          
          if (AuthService.isTokenExpired()) {
            console.log('Token expirado encontrado, removendo...');
            AuthService.removeAuthToken();
            return;
          }
          
          console.log('Token válido encontrado, redirecionando...');
          navigate(from, { replace: true });
        } catch (error) {
          console.error('Erro ao verificar token existente:', error);
          AuthService.removeAuthToken();
        }
      }
    };
    
    checkExistingAuth();
  }, [navigate, from]);
  
  /**
   * Callback para login bem-sucedido
   * @param {Object} credentialResponse - Resposta do Google OAuth
   */
  const handleLoginSuccess = (credentialResponse) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!credentialResponse.credential) {
        throw new Error('Credencial não recebida do Google');
      }
      
      // Log para debug (remova em produção)
      console.log('Credencial recebida com sucesso');
      
      // Decodificar o token para debug (não faça isso em produção)
      const tokenData = AuthService.decodeToken(credentialResponse.credential);
      setDebugInfo(tokenData ? { 
        sub: tokenData.sub,
        exp: new Date(tokenData.exp * 1000).toLocaleString(),
        email: tokenData.email
      } : null);
      
      // Salvar o token na autenticação
      AuthService.setAuthToken(credentialResponse.credential);
      
      // Redirecionar para o dashboard ou página original após um breve delay
      // O delay ajuda a evitar problemas de redirecionamento no OAuth
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    } catch (error) {
      console.error('Erro no processo de login:', error);
      setError(`Erro ao processar a autenticação: ${error.message}`);
      setIsLoading(false);
    }
  };
  
  /**
   * Callback para erro no login
   * @param {Object} error - Erro retornado pelo Google OAuth
   */
  const handleLoginError = (error) => {
    console.error('Erro de login:', error);
    setError('Falha na autenticação. Por favor, verifique sua conexão e tente novamente.');
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
            <div className="loading">Autenticando...</div>
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
              />
              
              {/* Nota informativa */}
              <p className="login-note">
                Ao fazer login, você autoriza o BlogCraft a acessar sua conta do Blogger.
              </p>
            </>
          )}
          
          {/* Informações de debug (remova em produção) */}
          {debugInfo && (
            <div className="debug-info" style={{marginTop: '20px', fontSize: '12px', color: '#888'}}>
              <p>ID: {debugInfo.sub}</p>
              <p>Email: {debugInfo.email}</p>
              <p>Expira: {debugInfo.exp}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;