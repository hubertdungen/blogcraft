import React from 'react';
import { render, screen } from '@testing-library/react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';

test('renders login page heading', () => {
  render(
    <GoogleOAuthProvider clientId="test">
      <App />
    </GoogleOAuthProvider>
  );
  const heading = screen.getByText(/blogcraft/i);
  expect(heading).toBeInTheDocument();
});
