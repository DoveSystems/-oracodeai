import React, { useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import FileTree from './FileTree'
import CodeEditor from './CodeEditor'
import Preview from './Preview'
import LogsPanel from './LogsPanel'
import StatusBar from './StatusBar'
import Header from './Header'
import AIChat from './AIChat'
import { initializeWebContainer } from '../utils/webcontainer'

const WorkspaceLayout = () => {
  const { files, showLogs, showAIChat, setStatus, addLog } = useAppStore()

  useEffect(() => {
    // Only start preview if we have files uploaded
    if (!files || Object.keys(files).length === 0) {
      return
    }

    // Initialize WebContainer and process the uploaded files
    const initializePreview = async () => {
      try {
        addLog({ type: 'info', message: '🚀 Preparing your project preview...' })
        setStatus('installing')
        
        // Validate files object
        if (!files || typeof files !== 'object') {
          throw new Error('Files object is invalid or undefined')
        }
        
        const fileCount = Object.keys(files).length
        if (fileCount === 0) {
          throw new Error('No files to process')
        }
        
        addLog({ type: 'info', message: `📁 Found ${fileCount} files to process` })
        
        // Initialize WebContainer
        const webcontainer = await initializeWebContainer()
        if (!webcontainer) {
          addLog({ type: 'warning', message: '⚠️ WebContainer not available, using fallback preview' })
          setStatus('readonly')
          return
        }
        
        addLog({ type: 'success', message: '✅ WebContainer initialized successfully' })
        
        // Mount the uploaded files to WebContainer
        addLog({ type: 'info', message: `📁 Mounting ${fileCount} files to WebContainer...` })
        
        // Convert files to the format WebContainer expects with comprehensive error handling
        const filesToMount = {}
        const skippedFiles = []
        const errors = []
        
        for (const [path, file] of Object.entries(files)) {
          try {
            // Validate file object
            if (!file) {
              errors.push(`File object is null/undefined for path: ${path}`)
              continue
            }
            
            if (!file.content && file.content !== '') {
              errors.push(`File content is missing for path: ${path}`)
              continue
            }
            
            // Validate file content size (WebContainer has limits)
            const contentSize = file.content ? file.content.length : 0
            if (contentSize > 10 * 1024 * 1024) { // 10MB limit per file
              errors.push(`File too large (${Math.round(contentSize / 1024 / 1024)}MB): ${path}`)
              continue
            }
            
            // Validate path
            if (!path || typeof path !== 'string') {
              errors.push(`Invalid path type: ${typeof path} for ${path}`)
              continue
            }
            
            if (path.length > 255) { // File system path length limit
              errors.push(`Path too long (${path.length} chars): ${path}`)
              continue
            }
            
            // Ultra-aggressive sanitization to prevent EIO errors
            let sanitizedPath = path
              // Remove ALL non-ASCII characters first
              .replace(/[^\x00-\x7F]/g, '_')
              // Remove control characters and invalid chars
              .replace(/[<>:"|?*\x00-\x1f\x7f-\x9f]/g, '_')
              // Normalize path separators
              .replace(/\\/g, '/')
              // Remove duplicate slashes
              .replace(/\/+/g, '/')
              // Remove leading/trailing slashes
              .replace(/^\/+/, '').replace(/\/+$/, '')
              // Replace any remaining non-alphanumeric chars except safe ones
              .replace(/[^\w\s\-_\.\/]/g, '_')
              // Replace spaces with underscores
              .replace(/\s+/g, '_')
              // Remove duplicate underscores
              .replace(/_+/g, '_')
              // Remove leading/trailing underscores
              .replace(/^_+|_+$/g, '')
              // Final cleanup - remove any remaining problematic chars
              .replace(/[^\w\-_\.\/]/g, '_')
              // Ensure it doesn't start with a dot (hidden files)
              .replace(/^\.+/, '')
              // Ensure it doesn't end with a dot
              .replace(/\.+$/, '')
            
            // Additional path validation
            if (sanitizedPath.includes('..')) {
              sanitizedPath = sanitizedPath.replace(/\.\./g, '_') // Prevent directory traversal
            }
            
            // Skip empty or invalid paths
            if (!sanitizedPath || sanitizedPath.length === 0) {
              skippedFiles.push({ path, reason: 'Empty path after sanitization' })
              continue
            }
            
            // Check for reserved names (Windows/Unix)
            const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9']
            const fileName = sanitizedPath.split('/').pop().split('.')[0].toUpperCase()
            if (reservedNames.includes(fileName)) {
              sanitizedPath = sanitizedPath.replace(fileName, fileName + '_')
            }
            
            // Check for duplicate paths
            if (filesToMount[sanitizedPath]) {
              sanitizedPath = sanitizedPath.replace(/(\.[^.]+)$/, '_duplicate$1')
            }
            
            // Validate content encoding
            let content = file.content
            if (typeof content !== 'string') {
              try {
                content = String(content)
              } catch (e) {
                errors.push(`Cannot convert content to string for: ${path}`)
                continue
              }
            }
            
            // Check for binary content that shouldn't be in WebContainer
            const binaryIndicators = ['\x00', '\x01', '\x02', '\x03', '\x04', '\x05', '\x06', '\x07', '\x08', '\x0b', '\x0c', '\x0e', '\x0f']
            const hasBinaryContent = binaryIndicators.some(indicator => content.includes(indicator))
            if (hasBinaryContent && !path.match(/\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|pdf|zip|tar|gz)$/i)) {
              skippedFiles.push({ path, reason: 'Binary content detected' })
              continue
            }
            
            // Final validation
            if (sanitizedPath.length > 255) {
              errors.push(`Sanitized path too long: ${sanitizedPath}`)
              continue
            }
            
            filesToMount[sanitizedPath] = {
              file: {
                contents: content
              }
            }
            
            // Special handling for known problematic files
            if (path.includes('choiceselector')) {
              console.log(`🔍 Debugging choiceselector file:`)
              console.log(`  Original path: "${path}"`)
              console.log(`  Sanitized path: "${sanitizedPath}"`)
              console.log(`  Path length: ${path.length}`)
              console.log(`  Sanitized length: ${sanitizedPath.length}`)
              console.log(`  Content size: ${contentSize} bytes`)
              console.log(`  Path bytes:`, Array.from(path).map(c => c.charCodeAt(0)))
              
              // Skip this problematic file entirely
              console.log(`⚠️ Skipping problematic choiceselector file to prevent EIO error`)
              skippedFiles.push({ path, reason: 'Known problematic file - skipping to prevent EIO error' })
              continue
            }
            
          } catch (error) {
            errors.push(`Error processing file ${path}: ${error.message}`)
            console.error(`Error processing file ${path}:`, error)
          }
        }
        
        // Log summary
        console.log(`📊 File processing summary:`)
        console.log(`  Total files: ${Object.keys(files).length}`)
        console.log(`  Files to mount: ${Object.keys(filesToMount).length}`)
        console.log(`  Skipped files: ${skippedFiles.length}`)
        console.log(`  Errors: ${errors.length}`)
        
        if (skippedFiles.length > 0) {
          console.log(`⚠️ Skipped files:`, skippedFiles)
        }
        
        if (errors.length > 0) {
          console.log(`❌ Errors:`, errors)
        }
        
        console.log('Files to mount:', Object.keys(filesToMount))
        console.log('Sample file structure:', filesToMount[Object.keys(filesToMount)[0]])
        
        // Validate that we have files to mount
        if (Object.keys(filesToMount).length === 0) {
          addLog({ type: 'warning', message: '⚠️ No files could be mounted - using fallback preview' })
          // Create a fallback preview with project overview
          const fallbackUrl = await createFallbackPreview(files)
          setPreviewUrl(fallbackUrl)
          setStatus('readonly')
          addLog({ type: 'info', message: '📄 Fallback preview created - you can still edit files!' })
          return
        }
        
        // Add user feedback about skipped files
        if (skippedFiles.length > 0) {
          addLog({ type: 'warning', message: `⚠️ Skipped ${skippedFiles.length} files (binary content, invalid paths, etc.)` })
        }
        
        if (errors.length > 0) {
          addLog({ type: 'warning', message: `⚠️ ${errors.length} files had processing errors` })
        }
        
        // Attempt to mount files with comprehensive error handling
        try {
          addLog({ type: 'info', message: `📁 Mounting ${Object.keys(filesToMount).length} files to WebContainer...` })
          
          // Add timeout for mounting process
          const mountPromise = webcontainer.mount(filesToMount)
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('File mounting timeout after 30 seconds')), 30000)
          })
          
          await Promise.race([mountPromise, timeoutPromise])
          addLog({ type: 'success', message: '✅ Files mounted successfully' })
          
        } catch (mountError) {
          console.error('WebContainer mount error:', mountError)
          
          // Provide specific error messages based on error type
          if (mountError.message.includes('EIO')) {
            addLog({ type: 'error', message: `❌ File system error: ${mountError.message}` })
            addLog({ type: 'info', message: '💡 Try uploading a different ZIP file or check for special characters in file names' })
          } else if (mountError.message.includes('timeout')) {
            addLog({ type: 'error', message: '❌ File mounting timed out - project may be too large' })
            addLog({ type: 'info', message: '💡 Try uploading a smaller project or fewer files' })
          } else if (mountError.message.includes('ENOSPC')) {
            addLog({ type: 'error', message: '❌ No space left on device - WebContainer storage full' })
            addLog({ type: 'info', message: '💡 Try refreshing the page and uploading again' })
          } else {
            addLog({ type: 'error', message: `❌ Mount failed: ${mountError.message}` })
          }
          
          throw mountError
        }
        
        // Install dependencies if package.json exists
        if (files['package.json']) {
          addLog({ type: 'info', message: '📦 Installing dependencies...' })
          setStatus('installing')
          
          try {
            // Add timeout for npm install
            const installProcess = await webcontainer.spawn('npm', ['install'])
            const installTimeout = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('npm install timeout after 5 minutes')), 300000) // 5 minutes
            })
            
            const installExitCode = await Promise.race([installProcess.exit, installTimeout])
            
            if (installExitCode !== 0) {
              throw new Error(`npm install failed with exit code ${installExitCode}`)
            }
            
            addLog({ type: 'success', message: '✅ Dependencies installed successfully' })
            
          } catch (installError) {
            console.error('npm install error:', installError)
            
            if (installError.message.includes('timeout')) {
              addLog({ type: 'error', message: '❌ npm install timed out - dependencies may be too large' })
              addLog({ type: 'info', message: '💡 Try uploading a project with fewer dependencies' })
            } else if (installError.message.includes('ENOSPC')) {
              addLog({ type: 'error', message: '❌ No space left for dependencies' })
              addLog({ type: 'info', message: '💡 Try refreshing the page and uploading again' })
            } else if (installError.message.includes('network') || installError.message.includes('fetch')) {
              addLog({ type: 'error', message: '❌ Network error during dependency installation' })
              addLog({ type: 'info', message: '💡 Check your internet connection and try again' })
            } else {
              addLog({ type: 'error', message: `❌ Dependency installation failed: ${installError.message}` })
            }
            
            throw installError
          }
        }
        
        // Start the development server
        addLog({ type: 'info', message: '🔧 Starting development server...' })
        setStatus('building')
        
        try {
          const devServerProcess = await webcontainer.spawn('npm', ['run', 'dev'])
          
          // Set up server ready handler
          const serverReadyPromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Development server startup timeout after 2 minutes'))
            }, 120000) // 2 minutes
            
            webcontainer.on('server-ready', (port, url) => {
              clearTimeout(timeout)
              resolve({ port, url })
            })
          })
          
          // Set up error handler for server process
          const serverErrorPromise = new Promise((_, reject) => {
            devServerProcess.exit.then((exitCode) => {
              if (exitCode !== 0) {
                reject(new Error(`Development server exited with code ${exitCode}`))
              }
            })
          })
          
          // Wait for either server ready or error
          const result = await Promise.race([serverReadyPromise, serverErrorPromise])
          
          if (result && result.url) {
            addLog({ type: 'success', message: `🎉 Development server ready at ${result.url}` })
            setStatus('running')
            // Set the preview URL in the store
            useAppStore.getState().setPreviewUrl(result.url)
          }
          
        } catch (serverError) {
          console.error('Development server error:', serverError)
          
          if (serverError.message.includes('timeout')) {
            addLog({ type: 'error', message: '❌ Development server startup timed out' })
            addLog({ type: 'info', message: '💡 The project may have complex build requirements' })
          } else if (serverError.message.includes('EADDRINUSE')) {
            addLog({ type: 'error', message: '❌ Port already in use - server conflict' })
            addLog({ type: 'info', message: '💡 Try refreshing the page and uploading again' })
          } else if (serverError.message.includes('ENOENT')) {
            addLog({ type: 'error', message: '❌ npm run dev command not found' })
            addLog({ type: 'info', message: '💡 Make sure your project has a dev script in package.json' })
          } else if (serverError.message.includes('exit code')) {
            addLog({ type: 'error', message: `❌ Development server failed: ${serverError.message}` })
            addLog({ type: 'info', message: '💡 Check your project configuration and dependencies' })
          } else {
            addLog({ type: 'error', message: `❌ Server startup failed: ${serverError.message}` })
          }
          
          setStatus('error')
          throw serverError
        }
        
      } catch (error) {
        console.error('Failed to initialize preview:', error)
        addLog({ type: 'error', message: `❌ Failed to initialize preview: ${error.message}` })
        
        // Try fallback preview as last resort
        try {
          addLog({ type: 'info', message: '🔄 Attempting fallback preview...' })
          const fallbackUrl = await createFallbackPreview(files)
          setPreviewUrl(fallbackUrl)
          setStatus('readonly')
          addLog({ type: 'success', message: '✅ Fallback preview created successfully!' })
        } catch (fallbackError) {
          console.error('Fallback preview failed:', fallbackError)
          setStatus('error')
        }
      }
    }
    
    initializePreview()
  }, [files, addLog, setStatus])

  // Fallback preview function
  const createFallbackPreview = async (files) => {
    const fileList = Object.keys(files).slice(0, 20).map(file => {
      const icon = getFileIcon(file)
      return `<div style="padding: 8px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 8px;">
        <span>${icon}</span>
        <span style="font-family: monospace; font-size: 14px;">${file}</span>
      </div>`
    }).join('')
    
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Preview - OraCodeAI</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            background: white;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            max-width: 800px;
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
        .status {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            color: #92400e;
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
            background: #f59e0b;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .file-list {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
        }
        .file-count {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }
        .warning {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 12px 16px;
            border-radius: 8px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">OA</div>
        <h1>Project Preview</h1>
        
        <div class="status">
            <div class="status-dot"></div>
            <span>Fallback Preview Active</span>
        </div>
        
        <div class="warning">
            <strong>⚠️ WebContainer Preview Unavailable</strong><br>
            Some files couldn't be mounted due to compatibility issues. You can still edit files using the code editor!
        </div>
        
        <div class="file-list">
            <div class="file-count">📁 Project Files (${Object.keys(files).length} files)</div>
            ${fileList}
            ${Object.keys(files).length > 20 ? `<div style="padding: 8px; color: #666; font-size: 14px;">... and ${Object.keys(files).length - 20} more files</div>` : ''}
        </div>
        
        <p style="text-align: center; color: #666; margin-top: 20px;">
            Your project is loaded and ready for development! Use the code editor to make changes.
        </p>
    </div>
</body>
</html>`
    
    const blob = new Blob([htmlContent], { type: 'text/html' })
    return URL.createObjectURL(blob)
  }

  const getFileIcon = (filename) => {
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

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 layout-container">
      <Header />
      <StatusBar />
      
      <div className="flex-1 flex overflow-hidden flex-container">
        {/* File Tree - Fixed Width */}
        <div className="w-64 flex-fixed bg-gradient-to-b from-gray-800 to-gray-900 border-r border-gray-600 shadow-lg">
          <FileTree />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex min-w-0 flex-container">
          {/* Left Panel: Editor and Preview */}
          <div className="flex-1 flex flex-col min-w-0 flex-constrained">
            {/* Editor and Preview - Fixed Split */}
            <div className="flex-1 flex overflow-hidden">
              {/* Code Editor - 50% width */}
              <div className="w-1/2 flex-fixed border-r border-gray-600 shadow-sm">
                <CodeEditor />
              </div>

              {/* Preview - 50% width */}
              <div className="w-1/2 flex-fixed">
                <Preview />
              </div>
            </div>

            {/* Logs Panel - Fixed Height */}
            {showLogs && (
              <div className="h-64 flex-fixed border-t border-gray-600 bg-gray-800/50 backdrop-blur-sm">
                <LogsPanel />
              </div>
            )}
          </div>

          {/* AI Chat Panel - Fixed Width */}
          {showAIChat && (
            <div className="w-96 flex-fixed border-l border-gray-600 bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg">
              <AIChat />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WorkspaceLayout
