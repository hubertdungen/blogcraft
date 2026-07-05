import React from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';

// Import all necessary styles
import './styles/index.css';
import './styles/app.css';
import './styles/dashboard.css';
import './styles/editor.css';
import './styles/templates.css';
import './styles/settings.css';
import './styles/feedback.css';
import './styles/debug.css';

const container = document.getElementById('root');
const root = createRoot(container);

// Keep a bundled OAuth client for portable/noob-friendly local use.
// Forks and maintainers can override it with REACT_APP_GOOGLE_CLIENT_ID.
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 
                 "404858006833-oc18gv2u640a1s0nst9ndkbvcj4qn1j0.apps.googleusercontent.com";

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
