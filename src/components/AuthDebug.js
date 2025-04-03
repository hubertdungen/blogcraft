import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import BloggerService from '../services/BloggerService';

/**
 * Componente para depuração de problemas de autenticação
 * Útil para diagnosticar problemas com a API do Blogger
 */
function AuthDebug() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [decodedToken, setDecodedToken] = useState(null);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [apiTestResult, setApiTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const checkToken = () => {
      const authToken = AuthService.getAuthToken();
      setToken(authToken || '');
      
      if (authToken) {
        // Decodificar token
        const decoded = AuthService.decodeToken(authToken);
        setDecodedToken(decoded);
        
        // Verificar expiração
        const expired = AuthService.isTokenExpired();
        setTokenExpired(expired);
      } else {
        setDecodedToken(null);
        setTokenExpired(false);
      }
    };
    
    checkToken();
  }, []);
  
  const handleClearToken = () => {
    if (window.confirm('Tem certeza que deseja remover o token de autenticação?')) {
      AuthService.removeAuthToken();
      navigate('/', { replace: true });
    }
  };
  
  const handleTestApi = async () => {
    setIsLoading(true);
    try {
      const result = await BloggerService.getUserBlogs();
      setApiTestResult({
        success: true,
        data: result
      });
    } catch (error) {
      setApiTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Formatar data de timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleString();
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Diagnóstico de Autenticação</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h2>Status do Token</h2>
        
        {token ? (
          <>
            <p><strong>Token encontrado:</strong> ✅</p>
            <p><strong>Token expirado:</strong> {tokenExpired ? '❌ Sim' : '✅ Não'}</p>
            
            {decodedToken && (
              <div>
                <h3>Informações do Token:</h3>
                <ul>
                  {decodedToken.email && <li><strong>Email:</strong> {decodedToken.email}</li>}
                  {decodedToken.name && <li><strong>Nome:</strong> {decodedToken.name}</li>}
                  {decodedToken.exp && <li><strong>Expira em:</strong> {formatDate(decodedToken.exp)}</li>}
                  {decodedToken.iat && <li><strong>Emitido em:</strong> {formatDate(decodedToken.iat)}</li>}
                  {decodedToken.aud && <li><strong>Audiência:</strong> {decodedToken.aud}</li>}
                  {decodedToken.iss && <li><strong>Emissor:</strong> {decodedToken.iss}</li>}
                  {decodedToken.scope && <li><strong>Escopos:</strong> {decodedToken.scope}</li>}
                </ul>
                
                <div style={{ 
                  padding: '10px', 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: '4px',
                  marginTop: '10px',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  <code>{JSON.stringify(decodedToken, null, 2)}</code>
                </div>
              </div>
            )}
            
            <div style={{ marginTop: '20px' }}>
              <button 
                onClick={handleClearToken}
                style={{
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Limpar Token
              </button>
            </div>
          </>
        ) : (
          <p>❌ Nenhum token de autenticação encontrado!</p>
        )}
      </div>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h2>Teste de Comunicação com a API</h2>
        
        <button 
          onClick={handleTestApi}
          disabled={isLoading || !token}
          style={{
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: isLoading || !token ? 0.6 : 1
          }}
        >
          {isLoading ? 'Testando...' : 'Testar Comunicação com API do Blogger'}
        </button>
        
        {apiTestResult && (
          <div style={{ marginTop: '15px' }}>
            {apiTestResult.success ? (
              <div>
                <p style={{ color: 'green' }}>✅ Comunicação bem-sucedida!</p>
                
                {apiTestResult.data.items && (
                  <div>
                    <p><strong>Blogs encontrados:</strong> {apiTestResult.data.items.length}</p>
                    
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                      {apiTestResult.data.items.map((blog) => (
                        <li key={blog.id} style={{
                          padding: '10px',
                          marginBottom: '8px',
                          backgroundColor: '#f9f9f9',
                          borderRadius: '4px',
                          border: '1px solid #eee'
                        }}>
                          <strong>{blog.name}</strong><br />
                          <a 
                            href={blog.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ fontSize: '14px', color: '#3498db' }}
                          >
                            {blog.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p style={{ color: 'red' }}>❌ Erro na comunicação com a API!</p>
                <p><strong>Mensagem de erro:</strong> {apiTestResult.error}</p>
                
                <div style={{ 
                  padding: '10px', 
                  backgroundColor: '#fff0f0', 
                  border: '1px solid #ffcccb',
                  borderRadius: '4px',
                  marginTop: '10px'
                }}>
                  <h4>Possíveis soluções:</h4>
                  <ol>
                    <li>Verificar se o token de autenticação é válido</li>
                    <li>Verificar se o token tem as permissões corretas (escopo blogger)</li>
                    <li>Verificar conexão com a Internet</li>
                    <li>Obter um novo token fazendo login novamente</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
        <h2>Configurações do OAuth</h2>
        
        <p><strong>Client ID:</strong> {process.env.REACT_APP_GOOGLE_CLIENT_ID || 'Não definido no ambiente'}</p>
        <p><strong>Escopo requerido:</strong> {AuthService.BLOGGER_API_SCOPE}</p>
        
        <h3>Verifique se:</h3>
        <ol>
          <li>O Client ID está configurado corretamente no Google Cloud Console</li>
          <li>As origens JavaScript autorizadas incluem seu domínio</li>
          <li>Os URIs de redirecionamento incluem seu domínio</li>
          <li>A API do Blogger está habilitada no projeto</li>
          <li>As credenciais OAuth têm escopo para API do Blogger</li>
        </ol>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{
            backgroundColor: '#2ecc71',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Voltar para Dashboard
        </button>
        
        <button 
          onClick={() => navigate('/')}
          style={{
            backgroundColor: '#f39c12',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Ir para Login
        </button>
      </div>
    </div>
  );
}

export default AuthDebug;