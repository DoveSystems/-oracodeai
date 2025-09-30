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
            
            // Sanitize file path to prevent EIO errors
            let sanitizedPath = path
              .replace(/[<>:"|?*\x00-\x1f\x7f-\x9f]/g, '_') // Replace invalid characters including control chars
              .replace(/\\/g, '/') // Normalize path separators
              .replace(/\/+/g, '/') // Remove duplicate slashes
              .replace(/^\/+/, '') // Remove leading slashes
              .replace(/\/+$/, '') // Remove trailing slashes
              .replace(/[^\w\s\-_\.\/]/g, '_') // Replace any remaining non-alphanumeric chars except safe ones
              .replace(/\s+/g, '_') // Replace spaces with underscores
              .replace(/_+/g, '_') // Remove duplicate underscores
              .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
            
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
            
            // Special debugging for the problematic file
            if (path.includes('choiceselector')) {
              console.log(`🔍 Debugging choiceselector file:`)
              console.log(`  Original path: "${path}"`)
              console.log(`  Sanitized path: "${sanitizedPath}"`)
              console.log(`  Path length: ${path.length}`)
              console.log(`  Sanitized length: ${sanitizedPath.length}`)
              console.log(`  Content size: ${contentSize} bytes`)
              console.log(`  Path bytes:`, Array.from(path).map(c => c.charCodeAt(0)))
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
          throw new Error('No valid files to mount after sanitization')
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
        setStatus('error')
      }
    }
    
    initializePreview()
  }, [files, addLog, setStatus])

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
