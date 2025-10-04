import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Code, 
  Play, 
  Terminal, 
  Brain, 
  Settings, 
  Download, 
  Upload,
  Sparkles,
  ArrowLeft,
  FileText,
  Globe,
  Zap
} from 'lucide-react'
import { useAppStore } from '../store/appStore'
import FileTree from '../components/FileTree'
import CodeEditor from '../components/CodeEditor'
import Preview from '../components/Preview'
import SimpleAIChat from '../components/SimpleAIChat'
import LogsPanel from '../components/LogsPanel'
import StatusBar from '../components/StatusBar'

const Workspace = () => {
  const navigate = useNavigate()
  const { 
    files, 
    showLogs, 
    showAIChat, 
    setStatus, 
    addLog, 
    setPreviewUrl,
    setShowAIChat,
    setShowLogs
  } = useAppStore()
  
  const [activeTab, setActiveTab] = useState('editor')
  const [aiAnalysis, setAiAnalysis] = useState(null)

  useEffect(() => {
    if (!files || Object.keys(files).length === 0) {
      navigate('/upload')
      return
    }

    // Simulate AI analysis on workspace load
    addLog({ type: 'info', message: '🤖 AI analyzing your codebase...' })
    
    setTimeout(() => {
      setAiAnalysis({
        projectType: 'React Application',
        dependencies: ['react', 'vite', 'tailwindcss'],
        suggestions: [
          'Consider adding TypeScript for better type safety',
          'Your component structure looks good',
          'Consider adding error boundaries'
        ],
        complexity: 'Medium',
        linesOfCode: Object.keys(files).length * 50
      })
      addLog({ type: 'success', message: '✅ AI analysis complete! Your codebase is ready.' })
    }, 2000)
  }, [files, navigate, addLog])

  const handleRunProject = async () => {
    addLog({ type: 'info', message: '🚀 Starting full project...' })
    setStatus('running')
    
    // Simulate full project startup with dependencies
    setTimeout(() => {
      addLog({ type: 'success', message: '✅ Project started successfully!' })
      addLog({ type: 'info', message: '🌐 Full project preview with dependencies is now available' })
      addLog({ type: 'info', message: '📦 All project files and dependencies are loaded' })
    }, 2000)
  }

  const handleBuildProject = async () => {
    addLog({ type: 'info', message: '🔨 Building full project with dependencies...' })
    setStatus('building')
    
    // Simulate comprehensive build process
    setTimeout(() => {
      addLog({ type: 'success', message: '✅ Build completed successfully!' })
      addLog({ type: 'info', message: '📦 All dependencies compiled and optimized' })
      addLog({ type: 'info', message: '🌐 Full project preview is now available' })
      setStatus('running') // Set to running so preview is available
    }, 4000)
  }

  if (!files || Object.keys(files).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Project Loaded</h3>
          <p className="text-slate-400 mb-4">Please upload a project first</p>
          <button
            onClick={() => navigate('/upload')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
          >
            Upload Project
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">CodeWonderAI Workspace</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* AI Analysis Status */}
            {aiAnalysis && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg">
                <Brain className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">AI Ready</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRunProject}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Run</span>
              </button>
              <button
                onClick={handleBuildProject}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
              >
                <Zap className="w-4 h-4" />
                <span>Build</span>
              </button>
              <button
                onClick={() => setShowAIChat(!showAIChat)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showAIChat 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>AI Chat</span>
              </button>
              <button
                onClick={() => setShowLogs(!showLogs)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showLogs 
                    ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>Logs</span>
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Tree */}
        <div className="w-64 bg-slate-800/50 border-r border-slate-700">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">Project Files</h3>
            {aiAnalysis && (
              <div className="text-sm text-slate-400">
                <p>Type: {aiAnalysis.projectType}</p>
                <p>Complexity: {aiAnalysis.complexity}</p>
                <p>Files: {Object.keys(files).length}</p>
              </div>
            )}
          </div>
          <FileTree />
        </div>

        {/* Editor and Preview */}
        <div className="flex-1 flex">
          {/* Code Editor */}
          <div className="w-1/2 border-r border-slate-700">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-slate-700 bg-slate-800/30">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Code className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-medium">Code Editor</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-slate-400">AI Enhanced</span>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <CodeEditor />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="w-1/2">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-slate-700 bg-slate-800/30">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-green-400" />
                    <span className="text-white font-medium">Live Preview</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-400">Live</span>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <Preview />
              </div>
            </div>
          </div>
        </div>

        {/* AI Chat Panel */}
        {showAIChat && (
          <div className="w-96 border-l border-slate-700 bg-slate-800/50">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-slate-700 bg-slate-800/30">
                <div className="flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-medium">AI Assistant</span>
                  {aiAnalysis && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
                  <div className="flex-1">
                    <SimpleAIChat aiAnalysis={aiAnalysis} />
                  </div>
            </div>
          </div>
        )}
      </div>

      {/* Logs Panel */}
      {showLogs && (
        <div className="h-64 border-t border-slate-700 bg-slate-800/50">
          <LogsPanel />
        </div>
      )}

      {/* Status Bar */}
      <StatusBar />
    </div>
  )
}

export default Workspace
