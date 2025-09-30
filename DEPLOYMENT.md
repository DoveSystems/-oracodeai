# OraCodeAI Deployment Guide

## 🚀 Netlify Deployment

### Automatic Deployment (Recommended)

1. **Connect to Netlify:**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Netlify will automatically detect the settings from `netlify.toml`

2. **Build Settings (Auto-detected):**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** 18

### Manual Deployment

1. **Build the project:**
   ```bash
   npm ci
   npm run build
   ```

2. **Deploy to Netlify:**
   - Drag and drop the `dist` folder to Netlify
   - Or use Netlify CLI: `netlify deploy --prod --dir=dist`

## 🛠️ Build Configuration

### Package.json Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production build locally

### Netlify Configuration (netlify.toml)
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Vite Configuration
- **Target:** ESNext for modern browsers
- **Minification:** ESBuild (fast and reliable)
- **Chunking:** Optimized for vendor, editor, and UI libraries
- **Assets:** Organized in `/assets` directory

## 📦 Production Optimizations

### Build Output
- **Total size:** ~431KB (gzipped: ~125KB)
- **Vendor chunk:** React, React-DOM (~140KB)
- **Editor chunk:** Monaco Editor (~14KB)
- **UI chunk:** Lucide React, Zustand (~18KB)
- **Main chunk:** Application code (~226KB)

### Performance Features
- **Code splitting:** Automatic chunking for better caching
- **Tree shaking:** Unused code elimination
- **Asset optimization:** CSS and JS minification
- **Modern ES:** ESNext target for optimal performance

## 🔧 Environment Variables

### Required for Production
- No environment variables required for basic functionality
- AI API keys are handled client-side (user input)

### Optional Environment Variables
- `VITE_APP_NAME` - Application name (default: OraCodeAI)
- `VITE_APP_VERSION` - Application version

## 🚀 Deployment Checklist

- [ ] ✅ Build command: `npm run build`
- [ ] ✅ Publish directory: `dist`
- [ ] ✅ Node version: 18
- [ ] ✅ Redirects configured for SPA
- [ ] ✅ PostCSS and Tailwind CSS configured
- [ ] ✅ Vite build optimized
- [ ] ✅ Dependencies installed
- [ ] ✅ No build errors

## 🌐 Live Preview

Once deployed, your OraCodeAI application will be available at:
- **Netlify URL:** `https://your-app-name.netlify.app`
- **Custom domain:** Configure in Netlify dashboard

## 📱 Features in Production

- ✅ **File Upload:** ZIP file processing
- ✅ **Code Editor:** Monaco Editor with syntax highlighting
- ✅ **Live Preview:** Data URL preview system
- ✅ **AI Integration:** OpenAI, Anthropic, Gemini support
- ✅ **Deployment:** Netlify, Vercel, GitHub Pages
- ✅ **Responsive Design:** Mobile-friendly interface
- ✅ **Modern UI:** Tailwind CSS styling

## 🔍 Troubleshooting

### Build Issues
- Ensure Node.js 18+ is installed
- Run `npm ci` to install exact dependencies
- Check for TypeScript errors: `npm run lint`

### Deployment Issues
- Verify `dist` folder exists after build
- Check Netlify build logs for errors
- Ensure all dependencies are in `package.json`

### Performance Issues
- Enable Netlify's CDN
- Configure caching headers
- Monitor bundle size

## 📞 Support

For deployment issues:
1. Check Netlify build logs
2. Verify build configuration
3. Test locally with `npm run preview`
4. Review this deployment guide

---

**OraCodeAI** - Advanced Code Editor & AI Assistant
Built with React, Vite, and Tailwind CSS
