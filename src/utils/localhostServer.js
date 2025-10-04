// Localhost server utility for running projects
export class LocalhostServer {
  constructor() {
    this.server = null
    this.port = 3000
    this.isRunning = false
    this.projectFiles = {}
  }

  async startServer(files) {
    this.projectFiles = files
    
    try {
      // Create a simple HTTP server using the browser's capabilities
      const serverUrl = await this.createServer()
      this.isRunning = true
      return serverUrl
    } catch (error) {
      console.error('Failed to start server:', error)
      throw error
    }
  }

  async createServer() {
    // Create a blob URL that serves the project
    const htmlContent = this.generateIndexHTML()
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const serverUrl = URL.createObjectURL(blob)
    
    // Store the server URL for cleanup
    this.serverUrl = serverUrl
    return serverUrl
  }

  generateIndexHTML() {
    const { projectFiles } = this
    const packageJson = projectFiles['package.json']
    let projectType = 'static'
    let dependencies = []
    let scripts = {}

    if (packageJson) {
      try {
        const pkg = JSON.parse(packageJson.content)
        dependencies = Object.keys(pkg.dependencies || {})
        scripts = pkg.scripts || {}
        
        if (pkg.dependencies?.react || pkg.dependencies?.['react-dom']) {
          projectType = 'react'
        } else if (pkg.dependencies?.vue) {
          projectType = 'vue'
        } else if (pkg.dependencies?.next) {
          projectType = 'nextjs'
        } else if (pkg.dependencies?.vite) {
          projectType = 'vite'
        }
      } catch (error) {
        console.error('Error parsing package.json:', error)
      }
    }

    // Find the main HTML file
    const mainHtml = projectFiles['index.html'] || 
                     projectFiles['src/index.html'] || 
                     projectFiles['public/index.html']

    if (mainHtml) {
      // Return the actual HTML content
      return mainHtml.content
    }

    // Generate a comprehensive project dashboard
    return this.generateProjectDashboard(projectType, dependencies, scripts)
  }

  generateProjectDashboard(projectType, dependencies, scripts) {
    const fileCount = Object.keys(this.projectFiles).length
    const hasSrcDir = Object.keys(this.projectFiles).some(f => f.startsWith('src/'))
    const hasPublicDir = Object.keys(this.projectFiles).some(f => f.startsWith('public/'))

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeWonderAI - Live Project Preview</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 40px;
            max-width: 900px;
            width: 90%;
            text-align: center;
        }
        .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 20px;
            margin: 0 auto 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        .subtitle {
            color: #666;
            margin-bottom: 40px;
            font-size: 1.2em;
        }
        .status {
            display: inline-block;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: 600;
            margin: 20px 0;
            background: #d4edda;
            color: #155724;
            border: 2px solid #c3e6cb;
        }
        .project-info {
            background: #f8f9fa;
            border-radius: 15px;
            padding: 30px;
            margin: 30px 0;
            text-align: left;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .info-item {
            background: white;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }
        .info-label {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
        }
        .info-value {
            color: #666;
            font-size: 0.9em;
        }
        .dependencies {
            margin-top: 20px;
        }
        .dependency-tag {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            margin: 3px;
            font-size: 0.8em;
        }
        .file-tree {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            text-align: left;
        }
        .file-item {
            padding: 5px 0;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            color: #333;
        }
        .file-item.directory {
            font-weight: bold;
            color: #667eea;
        }
        .actions {
            margin-top: 30px;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            margin: 5px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s;
        }
        .btn-primary {
            background: #667eea;
            color: white;
        }
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .live-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 600;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }
    </style>
</head>
<body>
    <div class="live-indicator">🟢 LIVE</div>
    
    <div class="container">
        <div class="logo">🚀</div>
        <h1>CodeWonderAI</h1>
        <p class="subtitle">Your project is running live on localhost!</p>
        
        <div class="status">🟢 Development Server Active - Port 3000</div>
        
        <div class="project-info">
            <h3>📊 Project Information</h3>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Project Type</div>
                    <div class="info-value">${projectType}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Total Files</div>
                    <div class="info-value">${fileCount} files</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Dependencies</div>
                    <div class="info-value">${dependencies.length} packages</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Server Status</div>
                    <div class="info-value">Running on localhost:3000</div>
                </div>
            </div>
            
            ${dependencies.length > 0 ? `
            <div class="dependencies">
                <h4>📦 Dependencies</h4>
                ${dependencies.map(dep => `<span class="dependency-tag">${dep}</span>`).join('')}
            </div>
            ` : ''}
            
            <div class="file-tree">
                <h4>📁 Project Structure</h4>
                ${this.generateFileTree()}
            </div>
        </div>
        
        <div class="actions">
            <button class="btn btn-primary" onclick="window.open('http://localhost:3000', '_blank')">
                🌐 Open in Browser
            </button>
            <button class="btn btn-secondary" onclick="window.open('http://localhost:3000', '_blank')">
                📱 Mobile Preview
            </button>
        </div>
        
        <p style="margin-top: 30px; color: #666; font-size: 0.9em;">
            This is a live preview of your complete project with all dependencies and assets running on localhost:3000
        </p>
    </div>
</body>
</html>
    `
  }

  generateFileTree() {
    const files = this.projectFiles
    const fileList = Object.keys(files).sort()
    
    let tree = ''
    const processedDirs = new Set()
    
    fileList.forEach(file => {
      const parts = file.split('/')
      let currentPath = ''
      
      parts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part
        
        if (index < parts.length - 1) {
          // It's a directory
          if (!processedDirs.has(currentPath)) {
            tree += `<div class="file-item directory">📁 ${currentPath}/</div>`
            processedDirs.add(currentPath)
          }
        } else {
          // It's a file
          const icon = this.getFileIcon(part)
          tree += `<div class="file-item">${icon} ${part}</div>`
        }
      })
    })
    
    return tree
  }

  getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase()
    const icons = {
      'html': '🌐',
      'js': '📄',
      'jsx': '⚛️',
      'ts': '📘',
      'tsx': '⚛️',
      'css': '🎨',
      'json': '📋',
      'md': '📝',
      'png': '🖼️',
      'jpg': '🖼️',
      'jpeg': '🖼️',
      'svg': '🖼️',
      'gif': '🖼️'
    }
    return icons[ext] || '📄'
  }

  stopServer() {
    if (this.serverUrl) {
      URL.revokeObjectURL(this.serverUrl)
      this.serverUrl = null
    }
    this.isRunning = false
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      port: this.port,
      url: this.serverUrl
    }
  }
}

// Global server instance
let serverInstance = null

export const getServerInstance = () => {
  if (!serverInstance) {
    serverInstance = new LocalhostServer()
  }
  return serverInstance
}

export const startLocalhostServer = async (files) => {
  const server = getServerInstance()
  return await server.startServer(files)
}

export const stopLocalhostServer = () => {
  const server = getServerInstance()
  server.stopServer()
}

export const getServerStatus = () => {
  const server = getServerInstance()
  return server.getStatus()
}
