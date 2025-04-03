# BlogCraft - Advanced Blogger Editor

###  UNDER DEVELOPMENT - NOT WORKING YET ###

BlogCraft is a modern web application designed to replace discontinued tools like Open Live Writer, offering a comprehensive solution for editing and publishing on Blogger with an advanced interface and powerful features.

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher (recommended)
- npm (v9+) or Yarn (v1.22+)
- Google Account with Blogger access

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/blogcraft.git
   cd blogcraft
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure environment variables
   - Create a `.env` file in the project root with the following:
   ```
   # Google OAuth Client ID (from Google Cloud Console)
   REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

   # TinyMCE API Key (optional but recommended)
   REACT_APP_TINYMCE_API_KEY=your-tinymce-api-key
   ```

4. Set up Google OAuth
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Blogger API
   - Create OAuth 2.0 credentials:
     * Application type: Web application
     * Authorized JavaScript origins: `http://localhost:3000`
     * Authorized redirect URIs: `http://localhost:3000`
   - Copy the Client ID to your `.env` file

5. Run the application
   ```bash
   npm start
   # or
   yarn start
   ```

6. Access the application at `http://localhost:3000`

## 🔑 Authentication Guide

### Google OAuth Setup

1. **Create Google Cloud Project**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable APIs**
   - Navigate to "APIs & Services"
   - Enable "Blogger API"
   - Enable "Google+ API"

3. **Create OAuth Credentials**
   - Go to "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"
   - Add authorized origins and redirect URIs
     * For local development: `http://localhost:3000`
     * For production: Your actual domain

4. **Configure Consent Screen**
   - Set up OAuth consent screen
   - Add required scopes:
     * `.../auth/blogger` (Blogger API)
     * `email`
     * `profile`

5. **Security Considerations**
   - Keep your Client ID and credentials confidential
   - Never commit sensitive information to version control
   - Use environment variables for sensitive data

### Troubleshooting
- Ensure your Google account has Blogger access
- Verify Client ID and scopes match your application
- Check network connectivity
- Ensure browser supports modern OAuth flows

## 📚 More Help
- [Blogger API Documentation](https://developers.google.com/blogger/docs/3.0/getting_started)
- [Google OAuth Guide](https://developers.google.com/identity/protocols/oauth2)

## 💻 Development Tips
- Use incognito/private browsing to test login flows
- Clear browser cache if experiencing authentication issues
- Check browser console for detailed error messages

## 🛡️ Permissions
BlogCraft requires minimal permissions to:
- Read your Blogger blogs
- Create, edit, and manage blog posts
- Access basic profile information

---

Developed with ❤️ for the blogging community