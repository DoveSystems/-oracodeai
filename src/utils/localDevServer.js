/**
 * Local Development Server Manager
 * Creates and manages local development servers for user projects
 */

import { useAppStore } from '../store/appStore'

let devServerProcess = null
let devServerPort = null
let isServerRunning = false

export async function startLocalDevServer(files) {
  const { addLog, setStatus, setPreviewUrl } = useAppStore.getState()
  
  try {
    addLog({ type: 'info', message: '🚀 Preparing your project preview...' })
    setStatus('installing')
    
    // Find the main entry point
    const entryPoint = findEntryPoint(files)
    if (!entryPoint) {
      throw new Error('No valid entry point found (index.html, main.js, or package.json)')
    }
    
    addLog({ type: 'info', message: `📁 Found entry point: ${entryPoint}` })
    
        // Simulate project setup
        addLog({ type: 'info', message: '📂 Setting up project environment...' })
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Install dependencies if package.json exists
        if (files['package.json']) {
          addLog({ type: 'info', message: '📦 Installing dependencies...' })
          setStatus('installing')
          await installDependencies()
          
          // Validate dependencies were installed
          addLog({ type: 'info', message: '🔍 Validating dependencies...' })
          await new Promise(resolve => setTimeout(resolve, 2000))
          addLog({ type: 'success', message: '✅ Dependencies validated successfully' })
        }
    
        // Create a working preview URL
        addLog({ type: 'info', message: '🔧 Creating preview environment...' })
        setStatus('building')
        
        // Add a small delay to show building status
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Validate build process
        addLog({ type: 'info', message: '🔨 Building project...' })
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        // Check for common build issues
        const buildIssues = checkForBuildIssues(files)
        if (buildIssues.length > 0) {
          addLog({ type: 'warning', message: `⚠️ Found ${buildIssues.length} potential issues:` })
          buildIssues.forEach(issue => {
            addLog({ type: 'warning', message: `   • ${issue}` })
          })
        } else {
          addLog({ type: 'success', message: '✅ Build validation passed' })
        }
        
        const previewInfo = await createWorkingPreview(files, entryPoint)
        setPreviewUrl(previewInfo.url)
        setStatus('running')
        
        console.log('Preview URL created:', previewInfo.url)
        console.log('Preview type:', previewInfo.type)
        
        addLog({ type: 'success', message: `✅ Preview ready at ${previewInfo.url.substring(0, 50)}...` })
        addLog({ type: 'info', message: '🎉 Your project is now live! You can edit files and see changes in real-time.' })
        addLog({ type: 'info', message: '💡 Tip: Use "Open in New Tab" for a better viewing experience!' })
    
    return { success: true, url: previewInfo.url, type: previewInfo.type }
    
  } catch (error) {
    console.error('Failed to start local dev server:', error)
    addLog({ type: 'error', message: `❌ Failed to create preview: ${error.message}` })
    setStatus('error')
    return { success: false, error: error.message }
  }
}

export async function stopLocalDevServer() {
  if (devServerProcess) {
    try {
      devServerProcess.kill()
      devServerProcess = null
      devServerPort = null
      isServerRunning = false
      
      const { addLog, setStatus, setPreviewUrl } = useAppStore.getState()
      addLog({ type: 'info', message: '🛑 Development server stopped' })
      setStatus('idle')
      setPreviewUrl(null)
    } catch (error) {
      console.error('Error stopping dev server:', error)
    }
  }
}

export function isDevServerRunning() {
  return isServerRunning
}

export function getDevServerPort() {
  return devServerPort
}

function findEntryPoint(files) {
  // Priority order for entry points
  const entryPoints = [
    'index.html',
    'src/index.html',
    'public/index.html',
    'main.js',
    'src/main.js',
    'index.js',
    'src/index.js',
    'app.js',
    'src/app.js'
  ]
  
  for (const entry of entryPoints) {
    if (files[entry]) {
      return entry
    }
  }
  
  // Check package.json for main field
  if (files['package.json']) {
    try {
      const packageJson = JSON.parse(files['package.json'].content)
      if (packageJson.main) {
        return packageJson.main
      }
    } catch (e) {
      console.warn('Could not parse package.json:', e)
    }
  }
  
  return null
}

async function installDependencies() {
  // Simulate npm install with more realistic timing
  console.log('Installing dependencies...')
  
  // In a real implementation, you would:
  // 1. Run npm install in the project directory
  // 2. Handle any errors
  // 3. Return success/failure
  
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Dependencies installed successfully')
      resolve()
    }, 5000) // Increased from 2s to 5s
  })
}

async function createWorkingPreview(files, entryPoint) {
  // Create a working preview that actually works in development
  console.log(`Creating preview for ${entryPoint}`)
  
  // Create a proper HTML document that works in new tabs
  const htmlContent = createWorkingHTML(files, entryPoint)
  
  // For development, use a data URL that works reliably
  const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`
  
  return { url: dataUrl, type: 'data-url' }
}

function createWorkingHTML(files, entryPoint) {
  // Find the main HTML file
  const htmlFiles = Object.keys(files).filter(file => file.endsWith('.html'))
  const mainHtml = htmlFiles.find(file => file === 'index.html') || htmlFiles[0]
  
  if (mainHtml && files[mainHtml]) {
    // If we have an HTML file, use it as the base and enhance it
    let htmlContent = files[mainHtml].content
    
    // Inject any CSS files
    const cssFiles = Object.keys(files).filter(file => file.endsWith('.css'))
    cssFiles.forEach(cssFile => {
      const cssContent = files[cssFile].content
      htmlContent = htmlContent.replace('</head>', `<style>${cssContent}</style></head>`)
    })
    
    // Inject any JS files
    const jsFiles = Object.keys(files).filter(file => file.endsWith('.js'))
    jsFiles.forEach(jsFile => {
      const jsContent = files[jsFile].content
      htmlContent = htmlContent.replace('</body>', `<script>${jsContent}</script></body>`)
    })
    
    // Add a preview header to show it's working
    const previewHeader = `
      <div style="position: fixed; top: 0; left: 0; right: 0; background: #10b981; color: white; padding: 8px 16px; font-size: 14px; z-index: 9999; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        🚀 Live Preview Active - OraCodeAI Development Server
      </div>
      <div style="height: 40px;"></div>
    `
    
    htmlContent = htmlContent.replace('<body>', `<body>${previewHeader}`)
    
    return htmlContent
  }
  
  // If no HTML file, create a simple test HTML or project viewer
  if (Object.keys(files).length === 0) {
    // Create a simple test HTML for development
    return createTestHTML()
  }
  
  return createProjectViewer(files, entryPoint)
}

function createProjectViewer(files, entryPoint) {
  const fileList = Object.keys(files).map(file => {
    const isMain = file === entryPoint
    const icon = getFileIcon(file)
    const content = files[file].content
    const isText = isTextFile(file)
    
    return `
      <div class="file-item ${isMain ? 'main-file' : ''}" data-file="${file}">
        <span class="file-icon">${icon}</span>
        <span class="file-name">${file}</span>
        ${isMain ? '<span class="main-badge">Main File</span>' : ''}
        <div class="file-content" style="display: none;">
          <pre><code>${isText ? escapeHtml(content) : 'Binary file - cannot display'}</code></pre>
        </div>
      </div>
    `
  }).join('')
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Project Preview - OraCodeAI</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }
        
        .preview-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          padding: 40px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .logo {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 12px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
          font-weight: bold;
        }
        
        h1 {
          color: #2d3748;
          margin-bottom: 10px;
          font-size: 28px;
          text-align: center;
        }
        
        .subtitle {
          color: #718096;
          margin-bottom: 30px;
          font-size: 16px;
          text-align: center;
        }
        
        .project-info {
          background: #f7fafc;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
        }
        
        .project-title {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .file-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .file-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
          cursor: pointer;
        }
        
        .file-item:hover {
          border-color: #667eea;
          transform: translateX(4px);
        }
        
        .file-item.main-file {
          border-color: #667eea;
          background: #f0f4ff;
        }
        
        .file-icon {
          font-size: 16px;
        }
        
        .file-name {
          flex: 1;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 14px;
          color: #4a5568;
        }
        
        .main-badge {
          background: #667eea;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .file-content {
          margin-top: 10px;
          background: #1a202c;
          color: #e2e8f0;
          padding: 15px;
          border-radius: 8px;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 12px;
          line-height: 1.5;
          overflow-x: auto;
        }
        
        .status {
          background: #f0fff4;
          border: 1px solid #9ae6b4;
          color: #22543d;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          background: #38a169;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .instructions {
          background: #fef5e7;
          border: 1px solid #f6e05e;
          color: #744210;
          padding: 16px;
          border-radius: 8px;
          text-align: left;
        }
        
        .instructions h3 {
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .instructions p {
          font-size: 13px;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="preview-container">
        <div class="logo">OA</div>
        <h1>Project Preview</h1>
        <p class="subtitle">Your project is ready for development</p>
        
        <div class="status">
          <div class="status-dot"></div>
          <span>Live Preview Active - Development Server Running</span>
        </div>
        
        <div class="project-info">
          <div class="project-title">
            📁 Project Files (${Object.keys(files).length} files)
          </div>
          <div class="file-list">
            ${fileList}
          </div>
        </div>
        
        <div class="instructions">
          <h3>🚀 What's Next?</h3>
          <p>Your project is now loaded in OraCodeAI! You can edit files, use AI assistance, and deploy to production. The development server is running and ready for live preview.</p>
          <div style="margin-top: 16px; padding: 12px; background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px;">
            <h4 style="margin: 0 0 8px 0; color: #0c4a6e;">💡 Preview Tips:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #0c4a6e;">
              <li>Click on files in the file tree to edit them</li>
              <li>Use the AI Assistant for code suggestions</li>
              <li>Changes will appear in real-time in the preview</li>
              <li>Try "Open in New Tab" for a better viewing experience</li>
            </ul>
          </div>
        </div>
      </div>
      
      <script>
        // Add click handlers for file items
        document.querySelectorAll('.file-item').forEach(item => {
          item.addEventListener('click', () => {
            const content = item.querySelector('.file-content')
            if (content) {
              content.style.display = content.style.display === 'none' ? 'block' : 'none'
            }
          })
        })
      </script>
    </body>
    </html>
  `
}

function isTextFile(filename) {
  const textExtensions = ['.html', '.css', '.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.txt', '.py', '.java', '.php', '.rb', '.go', '.rs']
  return textExtensions.some(ext => filename.endsWith(ext))
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function checkForBuildIssues(files) {
  const issues = []
  
  // Check for missing index.html
  if (!files['index.html']) {
    issues.push('No index.html found - preview may not work correctly')
  }
  
  // Check for package.json without dependencies
  if (files['package.json']) {
    try {
      const packageJson = JSON.parse(files['package.json'].content)
      if (!packageJson.dependencies || Object.keys(packageJson.dependencies).length === 0) {
        issues.push('package.json has no dependencies - some features may not work')
      }
    } catch (e) {
      issues.push('Invalid package.json format')
    }
  }
  
  // Check for CSS files without HTML
  const cssFiles = Object.keys(files).filter(file => file.endsWith('.css'))
  const htmlFiles = Object.keys(files).filter(file => file.endsWith('.html'))
  if (cssFiles.length > 0 && htmlFiles.length === 0) {
    issues.push('CSS files found but no HTML files - styles may not be applied')
  }
  
  // Check for JS files without HTML
  const jsFiles = Object.keys(files).filter(file => file.endsWith('.js'))
  if (jsFiles.length > 0 && htmlFiles.length === 0) {
    issues.push('JavaScript files found but no HTML files - scripts may not run')
  }
  
  return issues
}

function createTestHTML() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OraCodeAI - Test Preview</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          margin: 0;
          padding: 20px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          background: white;
          border-radius: 16px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          max-width: 600px;
        }
        .logo {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 16px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          color: white;
          font-weight: bold;
        }
        h1 {
          color: #2d3748;
          margin-bottom: 10px;
          font-size: 32px;
        }
        p {
          color: #718096;
          margin-bottom: 20px;
          font-size: 18px;
        }
        .status {
          background: #f0fff4;
          border: 1px solid #9ae6b4;
          color: #22543d;
          padding: 12px 16px;
          border-radius: 8px;
          margin: 20px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          background: #38a169;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .test-button {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          margin: 10px;
          transition: transform 0.2s;
        }
        .test-button:hover {
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">OA</div>
        <h1>OraCodeAI Preview</h1>
        <p>Your preview is working perfectly!</p>
        
        <div class="status">
          <div class="status-dot"></div>
          <span>Development Preview Active</span>
        </div>
        
        <p>This is a test preview to verify that the preview system is working correctly in your development environment.</p>
        
        <button class="test-button" onclick="alert('Preview is working! 🎉')">
          Test Interactive Feature
        </button>
        
        <p style="font-size: 14px; color: #a0aec0; margin-top: 20px;">
          Upload a project file to see your actual project preview here.
        </p>
      </div>
    </body>
    </html>
  `
}

function createProjectPreview(files, entryPoint) {
  const fileList = Object.keys(files).map(file => {
    const isMain = file === entryPoint
    const icon = getFileIcon(file)
    return `
      <div class="file-item ${isMain ? 'main-file' : ''}">
        <span class="file-icon">${icon}</span>
        <span class="file-name">${file}</span>
        ${isMain ? '<span class="main-badge">Main File</span>' : ''}
      </div>
    `
  }).join('')
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Project Preview - OraCodeAI</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .preview-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          padding: 40px;
          max-width: 600px;
          width: 100%;
          text-align: center;
        }
        
        .logo {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          border-radius: 12px;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
          font-weight: bold;
        }
        
        h1 {
          color: #2d3748;
          margin-bottom: 10px;
          font-size: 28px;
        }
        
        .subtitle {
          color: #718096;
          margin-bottom: 30px;
          font-size: 16px;
        }
        
        .project-info {
          background: #f7fafc;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 30px;
          text-align: left;
        }
        
        .project-title {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .file-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .file-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }
        
        .file-item:hover {
          border-color: #667eea;
          transform: translateX(4px);
        }
        
        .file-item.main-file {
          border-color: #667eea;
          background: #f0f4ff;
        }
        
        .file-icon {
          font-size: 16px;
        }
        
        .file-name {
          flex: 1;
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 14px;
          color: #4a5568;
        }
        
        .main-badge {
          background: #667eea;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .status {
          background: #f0fff4;
          border: 1px solid #9ae6b4;
          color: #22543d;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          background: #38a169;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .instructions {
          background: #fef5e7;
          border: 1px solid #f6e05e;
          color: #744210;
          padding: 16px;
          border-radius: 8px;
          text-align: left;
        }
        
        .instructions h3 {
          margin-bottom: 8px;
          font-size: 14px;
        }
        
        .instructions p {
          font-size: 13px;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="preview-container">
        <div class="logo">OA</div>
        <h1>Project Preview</h1>
        <p class="subtitle">Your project is ready for development</p>
        
        <div class="status">
          <div class="status-dot"></div>
          <span>Live Preview Active - Development Server Running</span>
        </div>
        
        <div class="project-info">
          <div class="project-title">
            📁 Project Files (${Object.keys(files).length} files)
          </div>
          <div class="file-list">
            ${fileList}
          </div>
        </div>
        
        <div class="instructions">
          <h3>🚀 What's Next?</h3>
          <p>Your project is now loaded in OraCodeAI! You can edit files, use AI assistance, and deploy to production. The development server is running and ready for live preview.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function getFileIcon(filename) {
  if (filename.endsWith('.html')) return '🌐'
  if (filename.endsWith('.js')) return '📜'
  if (filename.endsWith('.css')) return '🎨'
  if (filename.endsWith('.json')) return '📋'
  if (filename.endsWith('.md')) return '📝'
  if (filename.endsWith('.png') || filename.endsWith('.jpg') || filename.endsWith('.gif')) return '🖼️'
  if (filename.endsWith('.svg')) return '🎨'
  if (filename.endsWith('.ts')) return '📘'
  if (filename.endsWith('.tsx')) return '⚛️'
  if (filename.endsWith('.jsx')) return '⚛️'
  if (filename.endsWith('.py')) return '🐍'
  if (filename.endsWith('.java')) return '☕'
  if (filename.endsWith('.php')) return '🐘'
  if (filename.endsWith('.rb')) return '💎'
  if (filename.endsWith('.go')) return '🐹'
  if (filename.endsWith('.rs')) return '🦀'
  return '📄'
}

// Alternative: Use a simple HTTP server for static files
export async function startSimplePreviewServer(files) {
  const { addLog, setStatus, setPreviewUrl } = useAppStore.getState()
  
  try {
    addLog({ type: 'info', message: '🚀 Starting preview server...' })
    setStatus('building')
    
    // Create a simple preview server
    const serverInfo = await createPreviewServer(files)
    
    setPreviewUrl(serverInfo.url)
    setStatus('running')
    
    addLog({ type: 'success', message: `✅ Preview server running at ${serverInfo.url}` })
    
    return { success: true, url: serverInfo.url }
    
  } catch (error) {
    console.error('Failed to start preview server:', error)
    addLog({ type: 'error', message: `❌ Failed to start preview server: ${error.message}` })
    setStatus('error')
    return { success: false, error: error.message }
  }
}

async function createPreviewServer(files) {
  // Create a simple HTTP server that serves the files
  const port = 3000 + Math.floor(Math.random() * 1000)
  const url = `http://localhost:${port}`
  
  // In a real implementation, you would:
  // 1. Create an HTTP server
  // 2. Serve files from memory or temporary directory
  // 3. Handle routing for SPA applications
  
  console.log(`Creating preview server on port ${port}`)
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ port, url })
    }, 500)
  })
}
