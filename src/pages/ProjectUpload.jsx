import React, { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Upload, 
  FolderOpen, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Loader, 
  Zap, 
  Code, 
  Image, 
  File, 
  Archive,
  ArrowRight,
  Sparkles,
  Brain,
  Play
} from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { processZipFile } from '../utils/zipProcessor'

const ProjectUpload = () => {
  const navigate = useNavigate()
  const { setFiles, setActiveFile, addLog, setStatus } = useAppStore()
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [error, setError] = useState(null)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(async (e) => {
    e.preventDefault()
    setIsDragOver(false)
    await processFiles(Array.from(e.dataTransfer.files))
  }, [])

  const handleFileInput = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    await processFiles(files)
  }

  const processFiles = async (files) => {
    if (files.length === 0) return

    setIsProcessing(true)
    setUploadProgress(0)
    setStatus('uploading')
    setError(null)

    try {
      addLog({ type: 'info', message: '📁 Analyzing uploaded project...' })
      
      // Handle ZIP files
      const zipFiles = files.filter(file => file.name.endsWith('.zip'))
      if (zipFiles.length > 0) {
        for (const zipFile of zipFiles) {
          addLog({ type: 'info', message: `📦 Processing ${zipFile.name}...` })
          const { files: extractedFiles, projectName } = await processZipFile(zipFile)
          
          setUploadProgress(50)
          setFiles(extractedFiles)
          setUploadedFiles(prev => [...prev, { name: zipFile.name, type: 'zip', size: zipFile.size }])
          addLog({ type: 'success', message: `✅ Extracted ${Object.keys(extractedFiles).length} files from ${zipFile.name}` })
        }
      }

      // Handle individual files
      const individualFiles = files.filter(file => !file.name.endsWith('.zip'))
      if (individualFiles.length > 0) {
        const fileMap = {}
        for (const file of individualFiles) {
          const content = await file.text()
          fileMap[file.name] = { content, path: file.name }
          setUploadedFiles(prev => [...prev, { name: file.name, type: getFileType(file.name), size: file.size }])
        }
        
        if (Object.keys(fileMap).length > 0) {
          setFiles(fileMap)
          addLog({ type: 'success', message: `✅ Loaded ${Object.keys(fileMap).length} individual files` })
        }
      }

      setUploadProgress(75)
      addLog({ type: 'info', message: '🤖 Starting AI analysis of codebase...' })
      
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setUploadProgress(100)
      setStatus('idle')
      setAnalysisComplete(true)
      addLog({ type: 'success', message: '🎉 Project analysis complete! Ready to start coding.' })
      
    } catch (error) {
      console.error('Upload error:', error)
      setError(error.message)
      addLog({ type: 'error', message: `❌ Upload failed: ${error.message}` })
      setStatus('error')
    } finally {
      setIsProcessing(false)
    }
  }

  const getFileType = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) return 'code'
    if (['html', 'css', 'scss', 'sass'].includes(ext)) return 'web'
    if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) return 'image'
    if (['zip', 'rar', '7z'].includes(ext)) return 'archive'
    return 'file'
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleContinue = () => {
    navigate('/workspace')
  }

  if (analysisComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Project Analysis Complete!</h1>
            <p className="text-xl text-slate-300 mb-8">
              Your project has been successfully analyzed. The AI has understood your codebase structure and is ready to assist you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Code Analysis</h3>
              <p className="text-slate-400 text-sm">AI has analyzed your codebase structure and dependencies</p>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Assistant Ready</h3>
              <p className="text-slate-400 text-sm">Chat with AI about your code with full context</p>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                <Play className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Live Preview</h3>
              <p className="text-slate-400 text-sm">Build and preview your application instantly</p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleContinue}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center space-x-2 text-lg mx-auto"
            >
              <span>Start Coding</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">CodeWonderAI</h1>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-8">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Upload Your <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Project</span>
            </h1>
            <p className="text-xl text-slate-300 mb-2">Upload your project files and let AI analyze your codebase</p>
            <p className="text-slate-400">Support for ZIP files, individual files, and entire project folders</p>
          </div>

          {/* Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-3xl p-12 transition-all duration-300 ${
              isDragOver 
                ? 'border-blue-400 bg-blue-500/10 scale-105' 
                : 'border-slate-600 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-700/50'
            }`}
          >
            {/* Upload Content */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                {isProcessing ? (
                  <Loader className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-white" />
                )}
              </div>
              
              <h3 className="text-2xl font-semibold text-white mb-2">
                {isProcessing ? 'Analyzing Project...' : 'Drop your project here or click to upload'}
              </h3>
              
              <p className="text-slate-400 mb-8">
                {isProcessing 
                  ? 'Please wait while we analyze your project structure and dependencies' 
                  : 'AI will automatically analyze your codebase and prepare the development environment'
                }
              </p>

              {/* Progress Bar */}
              {isProcessing && (
                <div className="w-full max-w-md mx-auto mb-6">
                  <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span>Processing...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex items-center justify-center space-x-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 hover:border-slate-500 transition-all duration-200 hover:scale-105 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <div className="font-medium text-white">Upload Project Files</div>
                  <div className="text-sm text-slate-400">ZIP, JS, HTML, CSS, etc.</div>
                </div>
              </button>

              {/* Supported Formats */}
              <div className="text-center mt-6">
                <p className="text-sm text-slate-500 mb-3">Supported formats:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['ZIP', 'JS', 'TS', 'HTML', 'CSS', 'JSON', 'MD', 'PY', 'PHP', 'GO'].map((format) => (
                    <span key={format} className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs">
                      {format}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mt-8 bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <div>
                  <h3 className="text-lg font-semibold text-red-400">Upload Error</h3>
                  <p className="text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Uploaded Files Preview */}
          {uploadedFiles.length > 0 && (
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-white mb-4">Uploaded Files</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="bg-slate-800 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                        {file.type === 'code' && <Code className="w-4 h-4 text-blue-400" />}
                        {file.type === 'web' && <FileText className="w-4 h-4 text-green-400" />}
                        {file.type === 'image' && <Image className="w-4 h-4 text-purple-400" />}
                        {file.type === 'archive' && <Archive className="w-4 h-4 text-orange-400" />}
                        {file.type === 'file' && <File className="w-4 h-4 text-slate-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{file.name}</p>
                        <p className="text-slate-400 text-sm">{formatFileSize(file.size)}</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".zip,.js,.jsx,.ts,.tsx,.html,.css,.scss,.sass,.json,.md,.py,.php,.go"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </div>
    </div>
  )
}

export default ProjectUpload
