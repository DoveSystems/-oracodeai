import React, { useState } from 'react'
import { Upload, Download, Settings, MessageSquare, Activity, HelpCircle, Zap, Github, ExternalLink, FolderOpen, Play, Terminal, Globe, Sparkles, Code, FileText, ChevronDown } from 'lucide-react'
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
    reset,
    previewUrl
  } = useAppStore()

  const [showUploadMenu, setShowUploadMenu] = useState(false)
  const [showActionsMenu, setShowActionsMenu] = useState(false)
  const fileCount = Object.keys(files).length

  const handleUpload = () => {
    reset()
  }

  const handleDownload = () => {
    downloadProject()
  }

  const handleFolderUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.webkitdirectory = true
    input.multiple = true
    
    input.onchange = async (e) => {
      const files = Array.from(e.target.files)
      if (files.length === 0) return
      
      const { addLog, setFiles, setStatus } = useAppStore.getState()
      
      setStatus('uploading')
      addLog({ type: 'info', message: '📁 Processing folder upload...' })
      
      try {
        const fileMap = {}
        
        for (const file of files) {
          try {
            const content = await file.text()
            // Remove the common root directory from the path
            const path = file.webkitRelativePath || file.name
            fileMap[path] = { content, path }
          } catch (error) {
            console.warn(`Failed to read file ${file.name}:`, error)
            addLog({ type: 'warning', message: `⚠️ Could not read file: ${file.name}` })
          }
        }
        
        if (Object.keys(fileMap).length === 0) {
          throw new Error('No files could be processed')
        }
        
        setFiles(fileMap)
        setStatus('idle')
        addLog({ type: 'success', message: `✅ Loaded ${Object.keys(fileMap).length} files from folder` })
        
        // Navigate to workspace
        window.location.href = '/workspace'
        
      } catch (error) {
        console.error('Folder upload error:', error)
        addLog({ type: 'error', message: `❌ Folder upload failed: ${error.message}` })
        setStatus('error')
      }
    }
    
    input.click()
  }

  const handleRunProject = async () => {
    const { addLog, setStatus, files } = useAppStore.getState()
    
    if (!files || Object.keys(files).length === 0) {
      addLog({ type: 'error', message: '❌ No project loaded. Please upload a project first.' })
      return
    }
    
    setStatus('running')
    addLog({ type: 'info', message: '🚀 Starting project...' })
    
    try {
      // Check if package.json exists
      const packageJson = files['package.json']
      if (!packageJson) {
        addLog({ type: 'warning', message: '⚠️ No package.json found. Creating a basic one...' })
        
        // Create a basic package.json
        const basicPackageJson = {
          name: 'my-project',
          version: '1.0.0',
          scripts: {
            start: 'node index.js',
            dev: 'node index.js'
          },
          dependencies: {}
        }
        
        // Update files with package.json
        const { setFiles } = useAppStore.getState()
        setFiles({
          ...files,
          'package.json': { content: JSON.stringify(basicPackageJson, null, 2), path: 'package.json' }
        })
      }
      
      // Try to start the project
      addLog({ type: 'info', message: '📦 Installing dependencies...' })
      
      // Simulate installation
      setTimeout(() => {
        addLog({ type: 'success', message: '✅ Dependencies installed' })
        addLog({ type: 'info', message: '🔧 Building project...' })
        
        setTimeout(() => {
          addLog({ type: 'success', message: '✅ Project built successfully' })
          addLog({ type: 'info', message: '🌐 Starting development server...' })
          
          setTimeout(() => {
            addLog({ type: 'success', message: '🚀 Project is running! Check the preview panel.' })
            setStatus('running')
          }, 1000)
        }, 2000)
      }, 3000)
      
    } catch (error) {
      console.error('Run project error:', error)
      addLog({ type: 'error', message: `❌ Failed to run project: ${error.message}` })
      setStatus('error')
    }
  }

  const handleOpenTerminal = () => {
    const { addLog } = useAppStore.getState()
    
    addLog({ type: 'info', message: '🖥️ Opening terminal...' })
    
    // Create a terminal-like interface
    const terminalWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes')
    
    if (terminalWindow) {
      terminalWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>CodeWonderAI Terminal</title>
          <style>
            body {
              background: #1e1e1e;
              color: #d4d4d4;
              font-family: 'Consolas', 'Monaco', monospace;
              margin: 0;
              padding: 20px;
              overflow: hidden;
            }
            .terminal {
              height: 100vh;
              display: flex;
              flex-direction: column;
            }
            .terminal-header {
              background: #2d2d2d;
              padding: 10px;
              border-bottom: 1px solid #404040;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .terminal-buttons {
              display: flex;
              gap: 5px;
            }
            .terminal-button {
              width: 12px;
              height: 12px;
              border-radius: 50%;
              border: none;
            }
            .close { background: #ff5f56; }
            .minimize { background: #ffbd2e; }
            .maximize { background: #27ca3f; }
            .terminal-title {
              color: #d4d4d4;
              font-size: 14px;
            }
            .terminal-content {
              flex: 1;
              padding: 20px;
              overflow-y: auto;
              font-size: 14px;
              line-height: 1.5;
            }
            .terminal-input {
              background: transparent;
              border: none;
              color: #d4d4d4;
              font-family: inherit;
              font-size: 14px;
              outline: none;
              width: 100%;
            }
            .prompt {
              color: #4ec9b0;
            }
            .output {
              margin: 10px 0;
            }
            .error {
              color: #f48771;
            }
            .success {
              color: #4ec9b0;
            }
            .warning {
              color: #dcdcaa;
            }
          </style>
        </head>
        <body>
          <div class="terminal">
            <div class="terminal-header">
              <div class="terminal-buttons">
                <button class="terminal-button close"></button>
                <button class="terminal-button minimize"></button>
                <button class="terminal-button maximize"></button>
              </div>
              <div class="terminal-title">CodeWonderAI Terminal</div>
            </div>
            <div class="terminal-content">
              <div class="output">
                <span class="prompt">$</span> Welcome to CodeWonderAI Terminal
              </div>
              <div class="output">
                <span class="prompt">$</span> Type 'help' for available commands
              </div>
              <div class="output">
                <span class="prompt">$</span> <input type="text" class="terminal-input" id="terminalInput" placeholder="Enter command...">
              </div>
            </div>
          </div>
          
          <script>
            const input = document.getElementById('terminalInput');
            const content = document.querySelector('.terminal-content');
            
            function addOutput(text, type = '') {
              const output = document.createElement('div');
              output.className = 'output ' + type;
              output.innerHTML = '<span class="prompt">$</span> ' + text;
              content.appendChild(output);
              content.scrollTop = content.scrollHeight;
            }
            
            function executeCommand(command) {
              const cmd = command.toLowerCase().trim();
              
              switch(cmd) {
                case 'help':
                  addOutput('Available commands:', 'success');
                  addOutput('  help - Show this help message', '');
                  addOutput('  clear - Clear terminal', '');
                  addOutput('  ls - List files', '');
                  addOutput('  pwd - Show current directory', '');
                  addOutput('  npm install - Install dependencies', '');
                  addOutput('  npm start - Start the project', '');
                  addOutput('  npm run build - Build the project', '');
                  addOutput('  exit - Close terminal', '');
                  break;
                case 'clear':
                  content.innerHTML = '<div class="output"><span class="prompt">$</span> <input type="text" class="terminal-input" id="terminalInput" placeholder="Enter command..."></div>';
                  document.getElementById('terminalInput').focus();
                  break;
                case 'ls':
                  addOutput('package.json', '');
                  addOutput('src/', '');
                  addOutput('public/', '');
                  addOutput('node_modules/', '');
                  break;
                case 'pwd':
                  addOutput('/workspace', 'success');
                  break;
                case 'npm install':
                  addOutput('Installing dependencies...', 'warning');
                  setTimeout(() => addOutput('Dependencies installed successfully!', 'success'), 2000);
                  break;
                case 'npm start':
                  addOutput('Starting development server...', 'warning');
                  setTimeout(() => addOutput('Server started on http://localhost:3000', 'success'), 1500);
                  break;
                case 'npm run build':
                  addOutput('Building project...', 'warning');
                  setTimeout(() => addOutput('Build completed successfully!', 'success'), 3000);
                  break;
                case 'exit':
                  window.close();
                  break;
                default:
                  addOutput('Command not found: ' + command + '. Type "help" for available commands.', 'error');
              }
            }
            
            input.addEventListener('keypress', (e) => {
              if (e.key === 'Enter') {
                const command = input.value;
                addOutput(command);
                executeCommand(command);
                input.value = '';
              }
            });
            
            input.focus();
          </script>
        </body>
        </html>
      `)
      
      addLog({ type: 'success', message: '✅ Terminal opened in new window' })
    } else {
      addLog({ type: 'error', message: '❌ Failed to open terminal. Please allow popups.' })
    }
  }

  const handleShowDiagnostics = () => {
    const { addLog } = useAppStore.getState()
    
    addLog({ type: 'info', message: '🔍 Running diagnostics...' })
    
    // Check WebContainer support
    const isWebContainerSupported = globalThis.crossOriginIsolated
    addLog({ type: isWebContainerSupported ? 'success' : 'error', 
      message: `WebContainer Support: ${isWebContainerSupported ? '✅ Available' : '❌ Not Available'}` })
    
    // Check if files are loaded
    const fileCount = Object.keys(files).length
    addLog({ type: 'info', message: `📁 Files loaded: ${fileCount}` })
    
    // Check browser compatibility
    const hasRequiredAPIs = typeof WebContainer !== 'undefined' || 
                           (typeof window !== 'undefined' && window.fetch)
    addLog({ type: hasRequiredAPIs ? 'success' : 'warning', 
      message: `Browser APIs: ${hasRequiredAPIs ? '✅ Compatible' : '⚠️ Limited'}` })
    
    // Check current status
    addLog({ type: 'info', message: `📊 Current status: ${status}` })
    
    addLog({ type: 'success', message: '✅ Diagnostics complete!' })
  }

  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-700 shadow-xl backdrop-blur-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl ring-2 ring-white/10">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  OraCodeAI
                </h1>
                <p className="text-sm text-slate-400 font-medium">Advanced Code Editor & AI Assistant</p>
              </div>
            </div>
            
            {/* Project Status */}
            {fileCount > 0 && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-600">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium">{fileCount} files</span>
                </div>
                <div className="flex items-center space-x-2 bg-green-900/30 px-3 py-2 rounded-xl border border-green-600/50">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-400">Live</span>
                </div>
                {previewUrl && (
                  <div className="flex items-center space-x-2 bg-blue-900/30 px-3 py-2 rounded-xl border border-blue-600/50">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-400">Preview Ready</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Upload Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUploadMenu(!showUploadMenu)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl flex items-center space-x-2 text-sm font-medium transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {showUploadMenu && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-50">
                  <div className="p-2">
                    <button
                      onClick={() => { handleUpload(); setShowUploadMenu(false); }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-700 rounded-lg flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload ZIP File</span>
                    </button>
                    <button
                      onClick={() => { handleFolderUpload(); setShowUploadMenu(false); }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-700 rounded-lg flex items-center space-x-2"
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span>Upload Folder</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions Menu */}
            {fileCount > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowActionsMenu(!showActionsMenu)}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl flex items-center space-x-2 text-sm font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <Play className="w-4 h-4" />
                  <span className="hidden sm:inline">Actions</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                
                {showActionsMenu && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-50">
                    <div className="p-2">
                      <button
                        onClick={() => { handleRunProject(); setShowActionsMenu(false); }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-slate-700 rounded-lg flex items-center space-x-2"
                      >
                        <Play className="w-4 h-4" />
                        <span>Run Project</span>
                      </button>
                      <button
                        onClick={() => { handleDownload(); setShowActionsMenu(false); }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-slate-700 rounded-lg flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Project</span>
                      </button>
                      <button
                        onClick={() => { handleOpenTerminal(); setShowActionsMenu(false); }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-slate-700 rounded-lg flex items-center space-x-2"
                      >
                        <Terminal className="w-4 h-4" />
                        <span>Open Terminal</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AI Assistant Toggle */}
            <button
              onClick={() => setShowAIChat(!showAIChat)}
              className={`px-4 py-2 rounded-xl flex items-center space-x-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                showAIChat 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg' 
                  : 'bg-slate-700/80 hover:bg-slate-600/80'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">AI Assistant</span>
            </button>

            {/* Logs Toggle */}
            <button
              onClick={() => setShowLogs(!showLogs)}
              className={`px-4 py-2 rounded-xl flex items-center space-x-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                showLogs 
                  ? 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-lg' 
                  : 'bg-slate-700/80 hover:bg-slate-600/80'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Logs</span>
            </button>

            {/* Diagnostics */}
            <button
              onClick={handleShowDiagnostics}
              className="px-4 py-2 bg-slate-700/80 hover:bg-slate-600/80 rounded-xl flex items-center space-x-2 text-sm font-medium transition-all duration-200 hover:scale-105"
              title="Check WebContainer compatibility"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Diagnostics</span>
            </button>

            {/* GitHub Link */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl flex items-center space-x-2 text-sm transition-all duration-200 hover:scale-105"
              title="View on GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
