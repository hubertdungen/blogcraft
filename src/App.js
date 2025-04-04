import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/app.css';
import './styles/feedback.css';

// Simplified version for troubleshooting

const TroubleshootingScreen = () => {
  const [error, setError] = useState(null);
  const [envVars, setEnvVars] = useState({});
  
  useEffect(() => {
    // Check if we can access env vars
    try {
      setEnvVars({
        clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'Not defined',
        oauthScope: process.env.REACT_APP_OAUTH_SCOPE || 'Not defined',
        tinymceKey: process.env.REACT_APP_TINYMCE_API_KEY || 'Not defined',
        nodeEnv: process.env.NODE_ENV || 'Not defined'
      });
    } catch (err) {
      setError(`Error accessing environment variables: ${err.message}`);
    }
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '50px auto', 
      background: '#fff',
      color: '#333',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
    }}>
      <h1>BlogCraft Troubleshooting</h1>
      
      {error && (
        <div style={{ color: 'red', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>
          {error}
        </div>
      )}
      
      <div style={{ margin: '20px 0' }}>
        <h2>Environment Variables</h2>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '4px', 
          overflow: 'auto' 
        }}>
          {JSON.stringify(envVars, null, 2)}
        </pre>
      </div>
      
      <div>
        <h2>Next Steps</h2>
        <ul>
          <li>Check if environment variables are loaded correctly</li>
          <li>Verify if Google OAuth configuration is set up</li>
          <li>Ensure all required dependencies are installed</li>
          <li>Check for any console errors</li>
        </ul>
        
        <button 
          onClick={() => window.location.href = '/login'}
          style={{
            background: '#4a6da7',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Try Loading Login Page
        </button>
      </div>
    </div>
  );
};

// Simplified Login component
const SimpleLogin = () => {
  return (
    <div style={{ 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f0f4f8'
    }}>
      <div style={{ 
        width: '100%',
        maxWidth: '400px',
        padding: '40px',
        borderRadius: '8px',
        background: 'white',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#4a6da7' }}>BlogCraft</h1>
        <p style={{ marginBottom: '30px' }}>Editor Avançado para Blogger</p>
        
        <div>
          <p>OAuth Configuration Status:</p>
          <pre style={{ 
            textAlign: 'left', 
            background: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            Client ID: {process.env.REACT_APP_GOOGLE_CLIENT_ID || 'Not configured'}
          </pre>
          
          <button 
            style={{
              marginTop: '20px',
              width: '100%',
              padding: '12px',
              background: '#4285F4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => alert('Google OAuth integration would happen here')}
          >
            Continue with Google
          </button>
          
          <p style={{ marginTop: '20px', fontSize: '14px' }}>
            <a href="/" style={{ color: '#4a6da7' }}>Back to Troubleshooting</a>
          </p>
        </div>
      </div>
    </div>
  );
};

// Main App component
function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light'; // Switch to light theme for troubleshooting
  });

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <div className={`app-container ${theme}`}>
        <Routes>
          <Route path="/" element={<TroubleshootingScreen />} />
          <Route path="/login" element={<SimpleLogin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;