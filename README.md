# BlogCraft - Advanced Blogger Editor

### Currently in Beta – functional release! ###

BlogCraft is a modern web application designed to replace discontinued tools like Open Live Writer, offering a comprehensive solution for editing and publishing on Blogger with an advanced interface and powerful features.

## 🆕 What's New

- **Beta v0.4.21** – the application is now runnable with essential features.
- Fixed theme toggle to seamlessly switch between light and dark modes.
- Updated test suite to ensure core functionality works as expected.
- Added optional wide content layout expanding editing area to 1600px.

## 🚀 Quick Start

### Downloaded portable release

For normal Windows users, the easiest path is the no-install executable:

1. Download the portable Windows `.exe` from the release.
2. Run it.
3. Open `http://localhost:3000` if the browser does not open automatically.
4. Sign in with the Google account that owns or can edit your Blogger blogs.

Normal users do not need to create a Google Cloud project, enable APIs, or edit
`.env` files. They only need to approve Blogger access during Google sign-in.
Google Authenticator is not a BlogCraft requirement; Google may still ask for
the user's normal two-factor authentication if their account has it enabled.

### Source/developer prerequisites

- Node.js 18.x or higher (recommended)
- npm (v9+) or Yarn (v1.22+)
- Google Account with Blogger access

### Run from source

1. Clone the repository
   ```bash
   git clone https://github.com/hubertdungen/blogcraft.git
   cd blogcraft
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Optional local configuration
   - Copy `.env.example` to `.env` only if you want to override defaults.
   - `REACT_APP_GOOGLE_CLIENT_ID` is optional for normal local use because
     BlogCraft includes a default OAuth client ID.
   - `REACT_APP_TINYMCE_API_KEY` is also optional.

4. Run the application
   ```bash
   # On macOS/Linux
   ./run.sh

   # On Windows
   run.bat

   # Or start manually
   npm start
   ```

5. Access the application at `http://localhost:3000`

## ✨ What's new

- Robust Google Sign-In via `@react-oauth/google` with Blogger scope
- Token handling improvements in `AuthService` and `TokenManager` (session checks, safer storage)
- `BloggerService` with caching, timeouts, and clearer error messages (401/403/429)
- Dashboard: blog selector, recent posts, and basic monthly stats
- Post Editor (TinyMCE): draft/publish, scheduling, labels, metadata injection, import (TXT/HTML/Word) and export to Word
- Templates Manager: create, edit, delete, and reuse content templates
- Settings: theme (dark/light), defaults, autosave/backup options
- i18n foundations (`en-US`, `pt-PT`) and improved styling

## 🔑 Authentication Guide

### Normal user login

BlogCraft uses Google OAuth to ask for Blogger permission. During login, choose
the same Google account shown in Blogger. If BlogCraft says "No blogs found",
use **Switch Google Account** and choose the account that owns or has author/admin
permission on the blogs.

The Blogger API returns only blogs where the signed-in account has authorship or
admin rights. If a blog appears in Blogger under a different Google account, it
will not appear in BlogCraft until that account is selected.

### Custom OAuth client setup

Most users should not need this section. Use it only when maintaining a public
release, running a fork, or replacing the bundled OAuth client ID.

1. **Create Google Cloud Project**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable APIs**
   - Navigate to "APIs & Services"
   - Enable "Blogger API"

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
   - OAuth Client IDs are public identifiers, but client secrets must never be
     used in the browser app or committed to version control
   - Keep the OAuth consent screen published/configured for the intended users
   - If the OAuth app is left in testing mode, only configured test users can
     sign in

### Troubleshooting
- Check the Google account shown at the top of the BlogCraft dashboard
- Use **Switch Google Account** if Blogger shows the blogs under another account
- Ensure your Google account has author/admin Blogger access
- Verify Client ID and scopes match your application
- Check network connectivity
- Ensure browser supports modern OAuth flows
- If you receive 401/403 errors, log out and sign in again
- The project uses `react-scripts` with `--openssl-legacy-provider` set in `npm` scripts for compatibility on Node 18

## 🧪 Build & Test

```bash
npm run build
npm test -- --watchAll=false
npm run serve
```

The production build will be created in `build/`. You can open
`build/index.html` directly to inspect the UI, but Google OAuth must run from
`http://localhost:3000` because Google does not accept `file://` as a web
origin.

## 📦 Portable Releases

Windows users can build a no-install portable executable:

```bat
build-release.bat
```

or:

```bash
npm run release
```

The Windows file is created at `dist/blogcraft-x.y.z-windows-x64.exe`.

macOS and Linux users can build a portable binary for their current OS:

```bash
./build-release.sh
# or
npm run release:current
```

Other release targets:

```bash
npm run release:win
npm run release:linux
npm run release:macos
npm run release:all
```

The release binary starts BlogCraft's local server. Run it, then open
`http://localhost:3000` in a browser. The first release build may download
Node runtime binaries used by `pkg`. macOS binaries are unsigned, so Apple
users may need to allow the app in macOS security settings or run it from
Terminal.

## 🕒 Background Scheduler Service

BlogCraft includes an optional Node.js scheduler that can publish posts at a later time even when the main UI is closed.

1. Add scheduled posts to `scheduled-posts.json` (see `scheduled-posts.example.json` for the structure).
2. Export a Blogger access token in `BLOGGER_TOKEN` and optionally set `SCHEDULED_POSTS_FILE`.
3. Run the service:
   ```bash
   npm run scheduler
   ```
The process will stay running and publish each post at its configured `publishDate`.

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

## 🗺️ Roadmap (short-term)
- Image upload conveniences and media management
- More powerful template variables and snippets
- Improved offline/auto-save experience

---

Developed with ❤️ for the blogging community
