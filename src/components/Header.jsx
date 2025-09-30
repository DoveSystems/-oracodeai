import React from 'react'
import { Upload, Download, Settings, MessageSquare, Activity, HelpCircle, Zap, Github, ExternalLink } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { downloadProject } from '../utils/projectActions'

const Header = () => {
  const { 
    showLogs, 
    setShowLogs, 
    showAIChat, 
    setShowAIChat,
    files,
    status,
    reset
  } = useAppStore()

  const fileCount = Object.keys(files).length

  const handleUpload = () => {
    reset()
  }

  const handleDownload = () => {
    downloadProject()
  }

  const handleShowDiagnostics = () => {
    // Add diagnostics functionality here
    console.log('Diagnostics clicked')
  }

  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-6 py-4 border-b border-gray-700 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">OraCodeAI</h1>
              <p className="text-xs text-gray-400 font-medium">Advanced Code Editor & AI Assistant</p>
            </div>
          </div>
          
          {fileCount > 0 && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="bg-gray-700 px-2 py-1 rounded">
                {fileCount} files
              </span>
                  <span className="px-2 py-1 rounded text-xs bg-green-600 text-white">
                    ✅ Full Support
                  </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Diagnostics Button */}
          <button
            onClick={handleShowDiagnostics}
            className="px-4 py-2 bg-gray-700/80 hover:bg-gray-600/80 rounded-lg flex items-center space-x-2 text-sm font-medium transition-all duration-200 hover:scale-105"
            title="Check WebContainer compatibility"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Diagnostics</span>
          </button>

          {/* Upload */}
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg flex items-center space-x-2 text-sm font-medium transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload ZIP</span>
          </button>

          {/* Download */}
          {fileCount > 0 && (
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg flex items-center space-x-2 text-sm font-medium transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>
          )}

          {/* AI Chat Toggle */}
          <button
            onClick={() => setShowAIChat(!showAIChat)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
              showAIChat 
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg' 
                : 'bg-gray-700/80 hover:bg-gray-600/80'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">AI Assistant</span>
          </button>

          {/* Logs Toggle */}
          <button
            onClick={() => setShowLogs(!showLogs)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
              showLogs 
                ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 shadow-lg' 
                : 'bg-gray-700/80 hover:bg-gray-600/80'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Logs</span>
          </button>

          {/* GitHub Link */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded flex items-center space-x-2 text-sm"
            title="View on GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>

    </header>
  )
}

export default Header
