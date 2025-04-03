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
  
  // Obter a rota para onde o usuário tentou acessar (para redirecionamento após login)
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Verificar se há mensagem de erro vinda do redirecionamento
  useEffect(() => {
    if (location.state?.authError) {
      setError(`Sessão expirada ou inválida: ${location.state.authError}`);
    }
  }, [location]);
  
  // Verificar se já está autenticado
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const token = AuthService.getAuthToken();
        
        if (token) {
          // Verificar localmente se o token parece válido
          const tokenData = AuthService.decodeToken(token);
          
          if (!tokenData) {
            console.log('Token inválido detectado');
            AuthService.removeAuthToken();
            return;
          }
          
          if (AuthService.isTokenExpired()) {
            console.log('Token expirado detectado');
            AuthService.removeAuthToken();
            return;
          }
          
          console.log('Token válido encontrado, redirecionando para dashboard');
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação existente:', error);
        AuthService.removeAuthToken();
      }
    };
    
    checkExistingAuth();
  }, [navigate]);
  
/**
 * Callback para login bem-sucedido
 * @param {Object} credentialResponse - Resposta do Google OAuth
 */
const handleLoginSuccess = (credentialResponse) => {
    setIsLoading(true);
    setError(null);
    
    console.log('Login bem-sucedido, processando credenciais...');
    console.log('Resposta contém credencial:', !!credentialResponse.credential);
    
    try {
      if (!credentialResponse.credential) {
        throw new Error('Credencial não recebida do Google');
      }
      
      // Verificar se o token é válido no formato
      const tokenData = AuthService.decodeToken(credentialResponse.credential);
      
      console.log('Token decodificado:', tokenData ? 'Sim' : 'Não');
      console.log('Detalhes do token:', JSON.stringify({
        sub: tokenData?.sub,
        exp: tokenData?.exp,
        scope: tokenData?.scope,
        aud: tokenData?.aud
      }));
      
      if (!tokenData) {
        throw new Error('Token inválido ou não pôde ser decodificado');
      }
      
      // VERIFICAÇÃO ADICIONAL: Validar se o token tem escopo suficiente
      // Isso é importante para confirmação, mesmo que o Google não inclua
      // o escopo diretamente no token (ele geralmente está na resposta completa)
      console.log('AVISO: Não estamos verificando o escopo do token, apenas seu formato');
      
      // Verificar se o token contém informações mínimas necessárias
      console.log('Token contém id:', !!tokenData.sub);
      console.log('Token contém expiração:', !!tokenData.exp);
      
      if (!tokenData.sub) {
        throw new Error('Token não contém ID do usuário');
      }
      
      // IMPORTANTE: Alguns tokens do Google não incluem exp no payload
      // Neste caso, vamos definir uma expiração arbitrária (1 hora)
      if (!tokenData.exp) {
        console.log('AVISO: Token não contém data de expiração. Usando valor padrão (1 hora)');
        const oneHourInSeconds = 3600;
        const currentTime = Math.floor(Date.now() / 1000);
        tokenData.exp = currentTime + oneHourInSeconds;
      }
      
      // Verificar se o token já está expirado (improvável, mas por segurança)
      const currentTime = Math.floor(Date.now() / 1000);
      if (tokenData.exp <= currentTime) {
        throw new Error('Token já expirado ao receber');
      }
      
      console.log('Token validado localmente. ID do usuário:', tokenData.sub);
      
      // Salvar o token
      AuthService.setAuthToken(credentialResponse.credential);
      
      // Mostrar feedback
      console.log('Token salvo, redirecionando...');
      
      // Redirecionar para o dashboard ou página original
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    } catch (error) {
      console.error('Erro no processamento do login:', error);
      setError(`Erro ao processar a autenticação: ${error.message}`);
      setIsLoading(false);
    }
  };
  
  /**
   * Callback para erro no login
   * @param {Error} error - Erro retornado pelo Google OAuth
   */
  const handleLoginError = (error) => {
    console.error('Erro no login Google OAuth:', error);
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
                scope={AuthService.BLOGGER_API_SCOPE}
              />
              
              {/* Nota informativa */}
              <p className="login-note">
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