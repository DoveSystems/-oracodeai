import React, { useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import FileTree from './FileTree'
import CodeEditor from './CodeEditor'
import Preview from './Preview'
import LogsPanel from './LogsPanel'
import StatusBar from './StatusBar'
import Header from './Header'
import AIChat from './AIChat'

const WorkspaceLayout = () => {
  const { files, showLogs, showAIChat, setStatus, addLog, setPreviewUrl } = useAppStore()

  useEffect(() => {
    // Only start preview if we have files uploaded
    if (!files || Object.keys(files).length === 0) {
      return
    }

    // NEW APPROACH: Simple, reliable preview system
    const initializePreview = async () => {
      try {
        addLog({ type: 'info', message: '🚀 Creating live preview...' })
        setStatus('building')
        
        // Validate files object
        if (!files || typeof files !== 'object') {
          throw new Error('Files object is invalid or undefined')
        }
        
        const fileCount = Object.keys(files).length
        if (fileCount === 0) {
          throw new Error('No files to process')
        }
        
        addLog({ type: 'info', message: `📁 Found ${fileCount} files to process` })
        
        // Create a working preview URL
        const previewUrl = await createLivePreview(files)
        setPreviewUrl(previewUrl)
        setStatus('running')
        
        addLog({ type: 'success', message: '✅ Live preview ready!' })
        addLog({ type: 'info', message: '🎉 Your project is now live and interactive!' })
        
      } catch (error) {
        console.error('Failed to create preview:', error)
        addLog({ type: 'error', message: `❌ Failed to create preview: ${error.message}` })
        setStatus('error')
      }
    }
    
    initializePreview()
  }, [files, addLog, setStatus, setPreviewUrl])

  // NEW: Create live preview without WebContainer
  const createLivePreview = async (files) => {
    // Find the main HTML file
    const htmlFiles = Object.keys(files).filter(file => file.endsWith('.html'))
    const mainHtml = htmlFiles.find(file => file === 'index.html') || htmlFiles[0]
    
    if (mainHtml && files[mainHtml]) {
      // We have an HTML file - create a working preview
      return createHTMLPreview(files, mainHtml)
    } else {
      // No HTML file - create a project overview
      return createProjectOverview(files)
    }
  }

  // Create HTML preview with all assets
  const createHTMLPreview = (files, mainHtml) => {
    let htmlContent = files[mainHtml].content
    
    // Inject all CSS files
    const cssFiles = Object.keys(files).filter(file => file.endsWith('.css'))
    cssFiles.forEach(cssFile => {
      const cssContent = files[cssFile].content
      htmlContent = htmlContent.replace('</head>', `<style>${cssContent}</style></head>`)
    })
    
    // Inject all JS files (but be smart about it)
    const jsFiles = Object.keys(files).filter(file => 
      file.endsWith('.js') && 
      !file.includes('node_modules') && 
      !file.includes('dist') &&
      !file.includes('build')
    )
    
    // Only inject simple JS files (not modules)
    jsFiles.forEach(jsFile => {
      const jsContent = files[jsFile].content
      if (!jsContent.includes('import ') && !jsContent.includes('export ')) {
        htmlContent = htmlContent.replace('</body>', `<script>${jsContent}</script></body>`)
      }
    })
    
    // Add a preview header
    const previewHeader = `
      <div style="position: fixed; top: 0; left: 0; right: 0; background: #1a1a1a; color: white; padding: 10px; z-index: 1000; font-family: monospace; font-size: 12px; border-bottom: 2px solid #333;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong>🚀 OraCodeAI Live Preview</strong> - 
            <span style="color: #4ade80;">●</span> Live Preview Active
          </div>
          <div style="color: #94a3b8;">
            ${Object.keys(files).length} files loaded
          </div>
        </div>
      </div>
      <div style="margin-top: 50px;"></div>
    `
    
    htmlContent = htmlContent.replace('<body>', `<body>${previewHeader}`)
    
    // Create blob URL
    const blob = new Blob([htmlContent], { type: 'text/html' })
    return URL.createObjectURL(blob)
  }

  // Create project overview when no HTML file
  const createProjectOverview = (files) => {
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
            background: #f0fff4;
            border: 1px solid #9ae6b4;
            color: #22543d;
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
            background: #38a169;
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
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">OA</div>
        <h1>Project Preview</h1>
        
        <div class="status">
            <div class="status-dot"></div>
            <span>Live Preview Active</span>
        </div>
        
        <div class="file-list">
            <div class="file-count">📁 Project Files (${Object.keys(files).length} files)</div>
            ${fileList}
            ${Object.keys(files).length > 20 ? `<div style="padding: 8px; color: #666; font-size: 14px;">... and ${Object.keys(files).length - 20} more files</div>` : ''}
        </div>
        
        <p style="text-align: center; color: #666; margin-top: 20px;">
            Your project is loaded and ready for development!
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
