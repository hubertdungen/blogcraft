import React from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';

import './styles/index.css';
import './styles/app.css';
import './styles/dashboard.css';
import './styles/editor.css';       // Importação do CSS do Editor
import './styles/templates.css';    // Importação do CSS dos Templates 
import './styles/settings.css';

const container = document.getElementById('root');
const root = createRoot(container);

// Obter Client ID do .env ou usar um valor armazenado localmente pelo usuário
const getClientId = () => {
  // Verificar se o usuário armazenou um Client ID personalizado
  const customClientId = localStorage.getItem('blogcraft_custom_client_id');
  
  // Usar o Client ID personalizado se existir, caso contrário usar o do .env
  return customClientId || process.env.REACT_APP_GOOGLE_CLIENT_ID;
};

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);