import React, { useEffect, useState } from 'react';
import AuthService from '../services/AuthService';

/**
 * Componente para depuração de autenticação
 * Adicione este componente ao seu App.js para rastrear problemas de autenticação
 */
function LoginDebugger() {
  const [debugLogs, setDebugLogs] = useState([]);
  const [token, setToken] = useState(null);
  
  useEffect(() => {
    // Adicionar logs iniciais
    addLog('LoginDebugger inicializado');
    
    // Verificar token atual
    const currentToken = AuthService.getAuthToken();
    setToken(currentToken ? 'Token presente' : 'Sem token');
    addLog(`Token: ${currentToken ? 'Presente' : 'Ausente'}`);
    
    if (currentToken) {
      // Decodificar token
      const decoded = AuthService.decodeToken(currentToken);
      if (decoded) {
        addLog(`Token decodificado: ${JSON.stringify(decoded)}`);
        
        // Verificar se tem sub (ID do usuário)
        addLog(`Token tem ID? ${decoded.sub ? 'Sim' : 'Não'}`);
        
        // Verificar expiração
        if (decoded.exp) {
          const currentTime = Math.floor(Date.now() / 1000);
          const expiresIn = decoded.exp - currentTime;
          addLog(`Token expira em: ${Math.round(expiresIn / 60)} minutos`);
          addLog(`Token expirado? ${expiresIn <= 0 ? 'Sim' : 'Não'}`);
        } else {
          addLog('Token não tem data de expiração');
        }
        
        // Verificar escopo
        addLog(`Token tem escopo Blogger? ${decoded.scope && decoded.scope.includes('blogger') ? 'Sim' : 'Não'}`);
      } else {
        addLog('Falha ao decodificar token');
      }
    }
    
    // Monitorar redirecionamentos
    const originalPushState = window.history.pushState;
    window.history.pushState = function() {
      addLog(`Navegação: ${arguments[2]}`);
      return originalPushState.apply(this, arguments);
    };
    
    // Monitorar localStorage
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function() {
      addLog(`localStorage set: ${arguments[0]} = [valor]`);
      return originalSetItem.apply(this, arguments);
    };
    
    const originalRemoveItem = localStorage.removeItem;
    localStorage.removeItem = function() {
      addLog(`localStorage remove: ${arguments[0]}`);
      return originalRemoveItem.apply(this, arguments);
    };
    
    // Limpar monkey patches na desmontagem
    return () => {
      window.history.pushState = originalPushState;
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
    };
  }, []);
  
  // Adicionar log com timestamp
  const addLog = (message) => {
    const time = new Date().toISOString().substr(11, 8);
    setDebugLogs(prev => [...prev, `${time}: ${message}`]);
  };
  
  // Estilo para o debugger
  const style = {
    position: 'fixed',
    bottom: '10px',
    right: '10px',
    width: '350px',
    maxHeight: '400px',
    overflow: 'auto',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: '12px',
    padding: '10px',
    zIndex: 9999,
    borderRadius: '5px'
  };
  
  return (
    <div style={style}>
      <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
        Auth Debugger | {token}
      </div>
      {debugLogs.map((log, index) => (
        <div key={index} style={{ marginBottom: '5px' }}>
          {log}
        </div>
      ))}
    </div>
  );
}

export default LoginDebugger;