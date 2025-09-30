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
        
        // Convert files to the format WebContainer expects
        const filesToMount = {}
        for (const [path, file] of Object.entries(files)) {
          if (file && file.content) {
            // Sanitize file path to prevent EIO errors
            const sanitizedPath = path
              .replace(/[<>:"|?*]/g, '_') // Replace invalid characters
              .replace(/\\/g, '/') // Normalize path separators
              .replace(/\/+/g, '/') // Remove duplicate slashes
              .replace(/^\/+/, '') // Remove leading slashes
              .replace(/\/+$/, '') // Remove trailing slashes
            
            // Skip empty or invalid paths
            if (sanitizedPath && sanitizedPath.length > 0) {
              filesToMount[sanitizedPath] = {
                file: {
                  contents: file.content
                }
              }
            } else {
              console.warn(`Skipping invalid file path: ${path}`)
            }
          }
        }
        
        console.log('Files to mount:', Object.keys(filesToMount))
        console.log('Sample file structure:', filesToMount[Object.keys(filesToMount)[0]])
        
        // Validate that we have files to mount
        if (Object.keys(filesToMount).length === 0) {
          throw new Error('No valid files to mount after sanitization')
        }
        
        await webcontainer.mount(filesToMount)
        addLog({ type: 'success', message: '✅ Files mounted successfully' })
        
        // Install dependencies if package.json exists
        if (files['package.json']) {
          addLog({ type: 'info', message: '📦 Installing dependencies...' })
          setStatus('installing')
          
          const installProcess = await webcontainer.spawn('npm', ['install'])
          const installExitCode = await installProcess.exit
          
          if (installExitCode !== 0) {
            throw new Error('Failed to install dependencies')
          }
          
          addLog({ type: 'success', message: '✅ Dependencies installed successfully' })
        }
        
        // Start the development server
        addLog({ type: 'info', message: '🔧 Starting development server...' })
        setStatus('building')
        
        const devServerProcess = await webcontainer.spawn('npm', ['run', 'dev'])
        
        // Wait for the server to be ready
        webcontainer.on('server-ready', (port, url) => {
          addLog({ type: 'success', message: `🎉 Development server ready at ${url}` })
          setStatus('running')
          // Set the preview URL in the store
          useAppStore.getState().setPreviewUrl(url)
        })
        
        // Check for server startup errors
        devServerProcess.exit.then((exitCode) => {
          if (exitCode !== 0) {
            addLog({ type: 'error', message: `❌ Development server failed with exit code ${exitCode}` })
            setStatus('error')
          }
        })
        
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
