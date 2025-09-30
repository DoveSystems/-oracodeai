import React, { useCallback, useState } from 'react'
import { Upload, FileArchive, AlertCircle, ExternalLink, CheckCircle, XCircle } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { processZipFile } from '../utils/zipProcessor'

const UploadZone = () => {
  const { setWorkspace, setFiles, setStatus, addLog, clearLogs } = useAppStore()
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = useCallback(async (file) => {
    if (!file) return

    if (!file.name.endsWith('.zip')) {
      addLog({ type: 'error', message: 'Please upload a ZIP file' })
      return
    }

    if (file.size > 200 * 1024 * 1024) { // 200MB limit
      addLog({ type: 'error', message: 'File too large. Maximum size is 200MB' })
      return
    }

    clearLogs()
    setStatus('uploading')
    addLog({ type: 'info', message: `Processing ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)...` })

    try {
      const { files, projectName } = await processZipFile(file)
      
      if (Object.keys(files).length === 0) {
        throw new Error('No valid files found in ZIP')
      }

      setFiles(files)
      setWorkspace({ name: projectName, id: Date.now().toString() })
      addLog({ type: 'success', message: `Successfully extracted ${Object.keys(files).length} files` })
      
      // Set status to readonly for now - WebContainer will be initialized separately
      setStatus('readonly')
      addLog({ type: 'info', message: 'Project loaded successfully! You can now edit files and use AI assistance.' })
      
    } catch (error) {
      console.error('Upload error:', error)
      addLog({ type: 'error', message: `Failed to process ZIP: ${error.message}` })
      setStatus('error')
    }
  }, [setWorkspace, setFiles, setStatus, addLog, clearLogs])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    handleFileUpload(file)
  }, [handleFileUpload])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0]
    handleFileUpload(file)
  }, [handleFileUpload])

  // Check WebContainer support
  const webContainerChecks = {
    sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
    crossOriginIsolated: typeof crossOriginIsolated !== 'undefined' && crossOriginIsolated,
    webWorkers: typeof Worker !== 'undefined',
    secureContext: typeof isSecureContext !== 'undefined' && isSecureContext
  }

  const isFullySupported = Object.values(webContainerChecks).every(Boolean)
  const hasPartialSupport = webContainerChecks.sharedArrayBuffer && webContainerChecks.webWorkers

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <FileArchive className="mx-auto h-16 w-16 text-blue-400 mb-4" />
          <h1 className="text-4xl font-bold mb-2">OraCodeAI</h1>
          <p className="text-gray-400 text-lg">
            Upload a ZIP file of your project and get instant code editor with AI assistance
          </p>
        </div>

        {/* Environment Status */}
        <div className={`border rounded-lg p-4 mb-6 ${
          isFullySupported 
            ? 'bg-green-900/20 border-green-600/30' 
            : hasPartialSupport 
            ? 'bg-yellow-900/20 border-yellow-600/30'
            : 'bg-red-900/20 border-red-600/30'
        }`}>
          <div className="flex items-start space-x-3">
            {isFullySupported ? (
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            )}
            <div className="text-sm">
              <p className={`font-medium mb-2 ${
                isFullySupported ? 'text-green-200' : 'text-yellow-200'
              }`}>
                {isFullySupported 
                  ? '✅ Full WebContainer Support' 
                  : hasPartialSupport 
                  ? '⚠️ Limited Support (Editor Only)'
                  : '❌ Basic Mode Only'
                }
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                {Object.entries(webContainerChecks).map(([check, passed]) => (
                  <div key={check} className="flex items-center space-x-2">
                    {passed ? (
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-400" />
                    )}
                    <span className={passed ? 'text-green-300' : 'text-red-300'}>
                      {check.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                  </div>
                ))}
              </div>

              <p className={`text-xs ${
                isFullySupported ? 'text-green-300' : 'text-yellow-300'
              }`}>
                {isFullySupported 
                  ? 'Live preview and full development environment available!'
                  : hasPartialSupport
                  ? 'Code editor with AI assistance available. Live preview requires deployment headers.'
                  : 'Basic file viewing only. Consider using a supported browser or deployment platform.'
                }
              </p>
            </div>
          </div>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
            dragActive 
              ? 'border-blue-400 bg-blue-400/10' 
              : 'border-gray-600 hover:border-blue-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input').click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-xl mb-2">Drop your ZIP file here</p>
          <p className="text-gray-400 mb-4">or click to browse</p>
          <p className="text-sm text-gray-500">
            Supports Vite, React, Next.js, SvelteKit, Astro, and static HTML projects
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Maximum file size: 200MB
          </p>
        </div>

        <input
          id="file-input"
          type="file"
          accept=".zip"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">🚀 Smart Detection</h3>
              <p className="text-gray-400">Automatically detects your framework and adapts accordingly</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">🤖 AI Assistant</h3>
              <p className="text-gray-400">Advanced AI that understands your codebase and makes intelligent changes</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">⚡ Adaptive Mode</h3>
              <p className="text-gray-400">
                {isFullySupported 
                  ? 'Full live preview with hot reload'
                  : 'Code editor with syntax highlighting and AI assistance'
                }
              </p>
            </div>
          </div>

          {/* Deployment Help */}
          {!isFullySupported && (
            <div className="mt-6 bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-blue-200 font-medium mb-2">🚀 Enable Full Features</p>
                  <p className="text-blue-300/80 mb-3">
                    To enable live preview, deploy with WebContainer-compatible headers:
                  </p>
                  <div className="space-y-2 text-xs">
                    <div>
                      <strong className="text-blue-200">✅ Recommended Platforms:</strong>
                      <p className="text-blue-300 ml-2">• Local development (Vite dev server)</p>
                      <p className="text-blue-300 ml-2">• Netlify (with proper headers)</p>
                      <p className="text-blue-300 ml-2">• Vercel (with vercel.json)</p>
                    </div>
                    <div>
                      <strong className="text-blue-200">❌ Limited Platforms:</strong>
                      <p className="text-blue-300 ml-2">• GitHub Pages (no header control)</p>
                      <p className="text-blue-300 ml-2">• Basic static hosts</p>
                    </div>
                  </div>
                  <a
                    href="https://web.dev/coop-coep/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 mt-3 text-xs"
                  >
                    <span>Learn about WebContainer requirements</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UploadZone
