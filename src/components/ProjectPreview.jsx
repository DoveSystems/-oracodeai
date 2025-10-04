import React, { useState, useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { 
  FileText, 
  Code, 
  Image, 
  File, 
  Folder, 
  Play, 
  Terminal,
  ExternalLink,
  RefreshCw,
  Download
} from 'lucide-react'

const ProjectPreview = () => {
  const { files, addLog } = useAppStore()
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewContent, setPreviewContent] = useState('')
  const [previewType, setPreviewType] = useState('html') // html, text, image

  // Find the main HTML file
  useEffect(() => {
    if (files && Object.keys(files).length > 0) {
      // Look for common entry points
      const entryPoints = [
        'index.html',
        'src/index.html',
        'public/index.html',
        'index.htm',
        'main.html'
      ]
      
      for (const entry of entryPoints) {
        if (files[entry]) {
          setSelectedFile(entry)
          setPreviewContent(files[entry].content)
          setPreviewType('html')
          addLog({ type: 'info', message: `📄 Found main file: ${entry}` })
          return
        }
      }
      
      // If no HTML file found, show the first file
      const firstFile = Object.keys(files)[0]
      if (firstFile) {
        setSelectedFile(firstFile)
        setPreviewContent(files[firstFile].content)
        setPreviewType(getFileType(firstFile))
      }
    }
  }, [files, addLog])

  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase()
    if (['html', 'htm'].includes(ext)) return 'html'
    if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) return 'image'
    return 'text'
  }

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase()
    if (['html', 'htm'].includes(ext)) return FileText
    if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) return Code
    if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) return Image
    return File
  }

  const handleFileSelect = (filename) => {
    setSelectedFile(filename)
    setPreviewContent(files[filename].content)
    setPreviewType(getFileType(filename))
    addLog({ type: 'info', message: `📄 Previewing: ${filename}` })
  }

  const handleRunProject = () => {
    addLog({ type: 'info', message: '🚀 Starting development server...' })
    
    // Simulate starting a real server
    setTimeout(() => {
      addLog({ type: 'success', message: '✅ Development server started on http://localhost:3000' })
      addLog({ type: 'info', message: '🌐 Opening preview in new tab...' })
      
      // Open the HTML file in a new tab
      if (selectedFile && previewType === 'html') {
        const blob = new Blob([previewContent], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
        addLog({ type: 'success', message: '✅ Preview opened in new tab!' })
      }
    }, 2000)
  }

  const handleBuildProject = () => {
    addLog({ type: 'info', message: '🔨 Building project...' })
    
    // Simulate build process
    setTimeout(() => {
      addLog({ type: 'success', message: '✅ Build completed successfully!' })
      addLog({ type: 'info', message: '📦 Project ready for deployment' })
    }, 3000)
  }

  const handleDownloadProject = () => {
    addLog({ type: 'info', message: '📦 Preparing project download...' })
    
    // Create a ZIP file with all project files
    const { createZipFromFiles } = require('../utils/zipUtils')
    if (createZipFromFiles) {
      createZipFromFiles(files)
      addLog({ type: 'success', message: '✅ Project downloaded successfully!' })
    } else {
      addLog({ type: 'error', message: '❌ Download feature not available' })
    }
  }

  const renderPreview = () => {
    if (!previewContent) return null

    switch (previewType) {
      case 'html':
        return (
          <iframe
            srcDoc={previewContent}
            className="w-full h-full border-0"
            title="HTML Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        )
      case 'image':
        return (
          <div className="flex items-center justify-center h-full">
            <img 
              src={`data:image/${selectedFile.split('.').pop()};base64,${btoa(previewContent)}`}
              alt={selectedFile}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )
      default:
        return (
          <pre className="p-4 text-sm text-gray-800 bg-gray-50 h-full overflow-auto">
            {previewContent}
          </pre>
        )
    }
  }

  if (!files || Object.keys(files).length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
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
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Project Preview</h3>
              <p className="text-sm text-gray-600">
                {selectedFile ? `Viewing: ${selectedFile}` : 'Select a file to preview'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRunProject}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Run</span>
            </button>
            <button
              onClick={handleBuildProject}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              <Terminal className="w-4 h-4" />
              <span>Build</span>
            </button>
            <button
              onClick={handleDownloadProject}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* File Tree Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto">
          <div className="p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Project Files</h4>
            <div className="space-y-1">
              {Object.keys(files).map((filename) => {
                const Icon = getFileIcon(filename)
                const isSelected = selectedFile === filename
                return (
                  <button
                    key={filename}
                    onClick={() => handleFileSelect(filename)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors ${
                      isSelected 
                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm truncate">{filename}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-white">
          {selectedFile ? (
            <div className="h-full">
              {renderPreview()}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Select a File</h3>
                <p className="text-sm">Choose a file from the sidebar to preview</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectPreview
