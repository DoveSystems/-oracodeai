import React, { useState, useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { 
  Play, 
  Square, 
  RefreshCw, 
  Terminal, 
  Download, 
  ExternalLink,
  Package,
  Code,
  Globe,
  AlertTriangle,
  CheckCircle,
  Loader,
  FileText,
  Folder,
  File
} from 'lucide-react'

const DirectPreview = () => {
  const { files, addLog } = useAppStore()
  const [isRunning, setIsRunning] = useState(false)
  const [buildStatus, setBuildStatus] = useState('idle')
  const [projectInfo, setProjectInfo] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileContent, setFileContent] = useState('')
  const [viewMode, setViewMode] = useState('project') // 'project' or 'file'

  useEffect(() => {
    analyzeProject()
  }, [files])

  const analyzeProject = () => {
    if (!files || Object.keys(files).length === 0) return

    const packageJson = files['package.json']
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

    setProjectInfo({
      type: projectType,
      dependencies,
      scripts,
      fileCount: Object.keys(files).length
    })

    addLog({ type: 'info', message: `📊 Project analyzed: ${projectType} project with ${Object.keys(files).length} files` })
  }

  const handleRunProject = async () => {
    if (isRunning) {
      handleStopProject()
      return
    }

    setIsRunning(true)
    setBuildStatus('running')
    addLog({ type: 'info', message: '🚀 Starting project preview...' })

    // Simulate server startup
    const serverSteps = [
      'Initializing project preview...',
      'Loading project files...',
      'Setting up preview environment...',
      'Starting preview server...',
      'Preview ready!'
    ]

    for (let i = 0; i < serverSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800))
      addLog({ type: 'info', message: `🚀 ${serverSteps[i]}` })
    }

    addLog({ type: 'success', message: '✅ Project preview started successfully!' })
    addLog({ type: 'info', message: '🌐 Preview is now available' })
  }

  const handleStopProject = () => {
    setIsRunning(false)
    setBuildStatus('idle')
    setViewMode('project')
    setSelectedFile(null)
    setFileContent('')
    addLog({ type: 'info', message: '⏹️ Project preview stopped' })
  }

  const handleFileSelect = (filename) => {
    const file = files[filename]
    if (file) {
      setSelectedFile(filename)
      setFileContent(file.content)
      setViewMode('file')
      addLog({ type: 'info', message: `📄 Viewing file: ${filename}` })
    }
  }

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase()
    if (['html', 'htm'].includes(ext)) return FileText
    if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) return Code
    if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) return File
    return File
  }

  const renderFileContent = () => {
    if (!selectedFile || !fileContent) return null

    const ext = selectedFile.split('.').pop().toLowerCase()
    
    if (['html', 'htm'].includes(ext)) {
      return (
        <iframe
          srcDoc={fileContent}
          className="w-full h-full border-0"
          title={`Preview of ${selectedFile}`}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      )
    }
    
    if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <img 
            src={`data:image/${ext};base64,${btoa(fileContent)}`}
            alt={selectedFile}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )
    }
    
    return (
      <pre className="p-4 text-sm text-gray-800 bg-gray-50 h-full overflow-auto font-mono">
        {fileContent}
      </pre>
    )
  }

  const renderProjectOverview = () => {
    if (!projectInfo) return null

    // Check if there's an HTML file to preview
    const htmlFiles = Object.keys(files).filter(f => f.endsWith('.html'))
    const mainHtml = htmlFiles.find(f => f === 'index.html') || htmlFiles[0]

    if (mainHtml && files[mainHtml]) {
      // Show the actual HTML content in an iframe
      return (
        <div className="h-full relative">
          <iframe
            srcDoc={files[mainHtml].content}
            className="w-full h-full border-0"
            title={`Preview of ${mainHtml}`}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
          <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold">
            🟢 LIVE - {mainHtml}
          </div>
          <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">
            <button 
              onClick={() => setViewMode('project')}
              className="hover:underline"
            >
              📊 Project Info
            </button>
          </div>
        </div>
      )
    }

    // Fallback to project dashboard if no HTML file
    return (
      <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">CodeWonderAI</h1>
            <p className="text-lg text-gray-600">Your project is running live!</p>
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold mt-4">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Development Server Active
            </div>
          </div>

          {/* Project Info */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">📊 Project Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Project Type</div>
                <div className="text-lg font-semibold text-blue-800">{projectInfo.type}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Total Files</div>
                <div className="text-lg font-semibold text-green-800">{projectInfo.fileCount}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium">Dependencies</div>
                <div className="text-lg font-semibold text-purple-800">{projectInfo.dependencies.length}</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Server Status</div>
                <div className="text-lg font-semibold text-orange-800">Running</div>
              </div>
            </div>
          </div>

          {/* Dependencies */}
          {projectInfo.dependencies.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">📦 Dependencies</h3>
              <div className="flex flex-wrap gap-2">
                {projectInfo.dependencies.map((dep, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {dep}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* File Tree */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">📁 Project Files</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {Object.keys(files).map((filename) => {
                const Icon = getFileIcon(filename)
                return (
                  <button
                    key={filename}
                    onClick={() => handleFileSelect(filename)}
                    className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 font-mono">{filename}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!files || Object.keys(files).length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <Code className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No Project Loaded</h3>
          <p className="text-sm">Upload a project to see the preview</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Direct Project Preview</h3>
              <p className="text-sm text-gray-600">
                {isRunning ? 'Preview is running' : 'Click Run to start preview'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRunProject}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                isRunning 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Stop' : 'Run'}</span>
            </button>
            {isRunning && (
              <button
                onClick={() => setViewMode('project')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  viewMode === 'project' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Project
              </button>
            )}
            {isRunning && selectedFile && (
              <button
                onClick={() => setViewMode('file')}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  viewMode === 'file' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                File
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-white">
        {!isRunning ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center max-w-md">
              <Globe className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Ready to Preview</h3>
              <p className="text-sm mb-4">
                Click "Run" to start the project preview and see your complete project.
              </p>
              {projectInfo && (
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <h4 className="font-semibold text-gray-700 mb-2">Project Details:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Type: {projectInfo.type}</div>
                    <div>Files: {projectInfo.fileCount}</div>
                    <div>Dependencies: {projectInfo.dependencies.length}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : viewMode === 'file' && selectedFile ? (
          <div className="h-full relative">
            {renderFileContent()}
            <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm">
              📄 {selectedFile}
            </div>
            <div className="absolute top-4 left-4 bg-gray-600 text-white px-3 py-2 rounded-lg text-sm">
              <button 
                onClick={() => setViewMode('project')}
                className="hover:underline"
              >
                ← Back to Project
              </button>
            </div>
          </div>
        ) : (
          renderProjectOverview()
        )}
      </div>
    </div>
  )
}

export default DirectPreview
