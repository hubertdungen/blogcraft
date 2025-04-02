import React from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <GoogleOAuthProvider clientId="404858006833-oc18gv2u640a1s0nst9ndkbvcj4qn1j0.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);