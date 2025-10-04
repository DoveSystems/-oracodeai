import React, { useState, useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { ExternalLink, RefreshCw, AlertTriangle, Code, Sparkles, Monitor, Play, Terminal, Globe, Zap, Settings, Download, Upload, Loader } from 'lucide-react'
import RealProjectPreview from './RealProjectPreview'
import { createTerminalWindow } from '../utils/terminal'

const Preview = () => {
  const { previewUrl, status, files, addLog } = useAppStore()
  const [connectionError, setConnectionError] = useState(false)
  const [previewMode, setPreviewMode] = useState('localhost') // 'localhost' or 'webcontainer'
  const [showPreviewControls, setShowPreviewControls] = useState(false)
  const [isBuilding, setIsBuilding] = useState(false)

  const handleRefresh = () => {
    if (previewUrl) {
      const iframe = document.getElementById('preview-iframe')
      if (iframe) {
        iframe.src = iframe.src
      }
      addLog({ type: 'info', message: '🔄 Refreshing preview...' })
    }
  }

  const handleBuild = async () => {
    setIsBuilding(true)
    addLog({ type: 'info', message: '🔨 Building project...' })
    
    // Simulate build process
    setTimeout(() => {
      setIsBuilding(false)
      addLog({ type: 'success', message: '✅ Build complete!' })
    }, 2000)
  }

  const handleRunDevServer = () => {
    const { setPreviewUrl } = useAppStore.getState()
    addLog({ type: 'info', message: '🚀 Starting development server...' })
    
    // Simulate dev server startup
    setTimeout(() => {
      addLog({ type: 'success', message: '✅ Development server started on http://localhost:3000' })
      setPreviewUrl('http://localhost:3000')
    }, 2000)
  }

  const handleOpenTerminal = () => {
    addLog({ type: 'info', message: '💻 Opening terminal...' })
    
    try {
      createTerminalWindow()
      addLog({ type: 'success', message: '✅ Terminal opened in new window' })
    } catch (error) {
      addLog({ type: 'error', message: `❌ Failed to open terminal: ${error.message}` })
    }
  }

  const handleOpenExternal = () => {
    if (previewUrl) {
      // Simple approach - just open the URL directly
      window.open(previewUrl, '_blank')
    }
  }

  const handleConnectionError = () => {
    setConnectionError(true)
    console.log('Preview connection failed')
  }

  const handleRetryConnection = () => {
    setConnectionError(false)
    if (previewUrl) {
      const iframe = document.getElementById('preview-iframe')
      if (iframe) {
        iframe.src = previewUrl
      }
    }
  }

  const handleFullScreen = () => {
    if (previewUrl) {
      // Create a full screen modal instead of opening new window
      // This avoids WebContainer URL restrictions
      const modal = document.createElement('div')
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: black;
        z-index: 9999;
        display: flex;
        flex-direction: column;
      `
      
      const header = document.createElement('div')
      header.style.cssText = `
        background: #1f2937;
        color: white;
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #374151;
      `
      
      const title = document.createElement('div')
      title.textContent = 'Full Screen Preview'
      title.style.cssText = 'font-weight: 600; display: flex; align-items: center; gap: 8px;'
      
      const titleIcon = document.createElement('span')
      titleIcon.innerHTML = '🖥️'
      title.prepend(titleIcon)
      
      const closeBtn = document.createElement('button')
      closeBtn.textContent = '✕ Close'
      closeBtn.style.cssText = `
        background: #374151;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
      `
      closeBtn.onmouseover = () => closeBtn.style.background = '#4b5563'
      closeBtn.onmouseout = () => closeBtn.style.background = '#374151'
      closeBtn.onclick = () => document.body.removeChild(modal)
      
      const iframe = document.createElement('iframe')
      iframe.src = previewUrl
      iframe.style.cssText = `
        flex: 1;
        border: none;
        width: 100%;
        background: white;
      `
      
      header.appendChild(title)
      header.appendChild(closeBtn)
      modal.appendChild(header)
      modal.appendChild(iframe)
      document.body.appendChild(modal)
      
      // Close on Escape key
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          document.body.removeChild(modal)
          document.removeEventListener('keydown', handleEscape)
        }
      }
      document.addEventListener('keydown', handleEscape)
    }
  }

  const fileCount = Object.keys(files).length

  return (
    <div className="h-full flex flex-col flex-constrained">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-3 border-b border-slate-600 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">Live Preview</span>
          </div>
          
          {status === 'readonly' && (
            <span className="text-xs bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded-lg border border-yellow-500/30">Read-only</span>
          )}
          {status === 'running' && (
            <span className="text-xs bg-green-600/20 text-green-300 px-2 py-1 rounded-lg border border-green-500/30 flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live</span>
            </span>
          )}
          {status === 'building' && (
            <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded-lg border border-blue-500/30 flex items-center space-x-1">
              <Loader className="w-3 h-3 animate-spin" />
              <span>Building</span>
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Preview Controls Toggle */}
          <button
            onClick={() => setShowPreviewControls(!showPreviewControls)}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center space-x-2 text-sm transition-all duration-200"
            title="Preview Controls"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Controls</span>
          </button>
          
          {previewUrl && (
            <>
              <button
                onClick={handleFullScreen}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center space-x-2 text-sm transition-all duration-200"
                title="Open in full screen modal"
              >
                <Monitor className="w-4 h-4" />
                <span className="hidden sm:inline">Full Screen</span>
              </button>
              <button
                onClick={handleRefresh}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all duration-200"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleOpenExternal}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all duration-200"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Preview Controls Panel */}
      {showPreviewControls && (
        <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-600/50">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={handleRunDevServer}
              className="px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 rounded-lg text-sm flex items-center space-x-2 transition-all duration-200 hover:scale-105"
            >
              <Play className="w-4 h-4" />
              <span>Run Dev Server</span>
            </button>
            <button
              onClick={handleBuild}
              disabled={isBuilding}
              className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg text-sm flex items-center space-x-2 transition-all duration-200 hover:scale-105 disabled:opacity-50"
            >
              {isBuilding ? <Loader className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              <span>{isBuilding ? 'Building...' : 'Build'}</span>
            </button>
            <button
              onClick={handleOpenTerminal}
              className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 rounded-lg text-sm flex items-center space-x-2 transition-all duration-200 hover:scale-105"
            >
              <Terminal className="w-4 h-4" />
              <span>Terminal</span>
            </button>
            <button
              onClick={() => setPreviewMode(previewMode === 'localhost' ? 'webcontainer' : 'localhost')}
              className="px-3 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 rounded-lg text-sm flex items-center space-x-2 transition-all duration-200 hover:scale-105"
            >
              <Globe className="w-4 h-4" />
              <span>Switch Mode</span>
            </button>
          </div>
        </div>
      )}
      
      <div className="flex-1 bg-white">
        {status === 'running' && previewUrl ? (
          <div className="h-full relative">
            <iframe
              id="preview-iframe"
              src={previewUrl}
              className="w-full h-full border-0"
              title="Preview"
              onError={handleConnectionError}
              onLoad={() => setConnectionError(false)}
            />
            
            {/* Floating Full Screen Button for better visibility */}
            <button
              onClick={handleFullScreen}
              className="absolute top-4 right-4 bg-black/80 hover:bg-black text-white px-3 py-2 rounded-lg flex items-center space-x-2 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105"
              title="Open preview in full screen modal for better viewing"
            >
              <Monitor className="w-4 h-4" />
              <span className="text-sm font-medium">Full Screen</span>
            </button>
            
            {/* Development Server Info */}
            <div className="absolute top-4 left-4 bg-green-600/90 text-white px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live Preview Active</span>
              </div>
              <div className="text-xs text-green-100 mt-1">
                {previewMode === 'localhost' ? 'Localhost Preview Ready' : 'WebContainer Preview Ready'}
              </div>
            </div>
            
            {/* Connection Error Overlay */}
            {connectionError && (
              <div className="absolute inset-0 bg-red-50 border-2 border-red-200 rounded-lg flex items-center justify-center">
                <div className="text-center p-6">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Connection Failed</h3>
                  <p className="text-sm text-red-600 mb-4">
                    Unable to load the preview. This might be due to network restrictions or browser security settings.
                  </p>
                  <div className="flex space-x-2 justify-center">
                    <button
                      onClick={handleRetryConnection}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Retry Connection
                    </button>
                    <button
                      onClick={() => window.open(previewUrl, '_blank')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Open in New Tab
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Connection Error Fallback */}
            <div className="absolute bottom-4 left-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-sm text-yellow-800 font-medium">Preview Tips</span>
                </div>
                <button
                  onClick={() => window.open(previewUrl, '_blank')}
                  className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded transition-colors"
                >
                  Open in New Tab
                </button>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                {previewMode === 'localhost' 
                  ? 'Localhost preview works offline. Try opening in a new tab for better viewing.'
                  : 'WebContainer preview requires proper headers. Try switching to localhost mode or opening in a new tab.'
                }
              </p>
            </div>
          </div>
        ) : status === 'running' && !previewUrl ? (
          <RealProjectPreview />
        ) : status === 'readonly' ? (
          <div className="h-full flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center max-w-lg p-8">
              <div className="mb-6">
                <Code className="w-20 h-20 mx-auto mb-4 text-blue-500" />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">Development Server Starting</h3>
                <p className="text-gray-600 mb-4">
                  Your project is being prepared for live preview. This may take a moment...
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 text-left">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                  What's happening:
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Installing project dependencies
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Setting up local development server
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Preparing live preview environment
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    AI Assistant ready for code modifications
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium mb-2">🚀 Live Preview Coming Soon</p>
                <p className="text-xs text-green-700">
                  Your project will be available at a localhost URL once the development server is ready.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              {status === 'installing' && (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p>Installing dependencies...</p>
                </>
              )}
              {status === 'building' && (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p>Building project...</p>
                </>
              )}
              {status === 'error' && (
                <div className="text-center">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-red-500" />
                  <p className="text-red-600">Failed to start preview. Check logs for details.</p>
                  <p className="text-sm text-gray-500 mt-2">You can still use the code editor!</p>
                </div>
              )}
              {status === 'idle' && (
                <div className="text-center">
                  <div className="mb-4">
                    <Code className="w-16 h-16 mx-auto text-blue-500" />
                  </div>
                  <p className="text-lg font-medium mb-2">Ready to Preview</p>
                  <p className="text-sm text-gray-500">Upload a project to see the live preview</p>
                </div>
              )}
              {status === 'uploading' && (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p>Processing your project...</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Preview
