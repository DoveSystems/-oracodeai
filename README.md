# OraCodeAI - Advanced Code Editor & AI Assistant

A powerful web-based code editor with AI assistance, live preview capabilities, and deployment integration.

## ✨ Features

- 🚀 **Live Preview** - Real-time code execution and preview with localhost/WebContainer options
- 🧠 **AI Assistant** - Intelligent code suggestions and modifications (OpenAI, Anthropic, Gemini)
- 📁 **ZIP Import/Export** - Easy project management and file handling
- 🎨 **Monaco Editor** - Professional code editor with syntax highlighting
- 🔧 **Deployment Integration** - Deploy to Netlify, Vercel, and GitHub Pages
- 📱 **Responsive Design** - Modern, mobile-friendly interface

## 🌐 Deployment

### Netlify (Recommended)

1. **Fork this repository**
2. **Connect to Netlify**
3. **Deploy** - The `netlify.toml` file will automatically configure the build settings

**Build Settings:**
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18

### Vercel

1. **Fork this repository**
2. **Connect to Vercel**
3. **Deploy** - The `vercel.json` file will automatically configure the build settings

### GitHub Pages

1. **Fork this repository**
2. **Enable GitHub Pages** in repository settings
3. **Deploy** - Use the `dist` folder as the source

### Quick Deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/oracodeai)

### Platform Compatibility

| Platform | Support | Configuration | Notes |
|----------|---------|---------------|-------|
| ✅ Netlify | Full Support | `netlify.toml` | Recommended |
| ✅ Vercel | Full Support | `vercel.json` | Great performance |
| ✅ GitHub Pages | Full Support | Manual setup | Free hosting |
| ✅ Any Static Host | Full Support | Manual upload | Upload `dist` folder |

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🧪 Testing Preview System

The preview system works in both development and production:
- **Localhost Mode**: Works offline, no connection issues
- **WebContainer Mode**: Advanced features for power users
- **Test Preview**: Beautiful test page when no files are uploaded

## 🤖 AI Assistant

The AI Assistant supports multiple providers with your own API keys:

- **OpenAI** - Get your key at [platform.openai.com](https://platform.openai.com/api-keys)
- **Anthropic** - Get your key at [console.anthropic.com](https://console.anthropic.com/account/keys)
- **Google Gemini** - Get your key at [makersuite.google.com](https://makersuite.google.com/app/apikey)

API keys are stored locally in your browser and never sent to our servers.

## 🚀 Deployment Features

- **Real Deployment**: Deploy to Netlify, Vercel, and GitHub Pages with real API integration
- **API Key Validation**: Verify deployment tokens before deployment
- **Live Status**: Real-time deployment status and logs
- **Error Handling**: Comprehensive error handling and user feedback

## 📝 License

MIT License - see LICENSE file for details.
