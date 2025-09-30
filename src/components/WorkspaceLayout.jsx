import React, { useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import FileTree from './FileTree'
import CodeEditor from './CodeEditor'
import Preview from './Preview'
import LogsPanel from './LogsPanel'
import StatusBar from './StatusBar'
import Header from './Header'
import AIChat from './AIChat'
import { startLocalDevServer } from '../utils/localDevServer'

const WorkspaceLayout = () => {
  const { files, showLogs, showAIChat } = useAppStore()

  useEffect(() => {
    // Start local development server for testing (even with no files)
    const startDevServer = async () => {
      try {
        await startLocalDevServer(files)
      } catch (error) {
        console.error('Failed to start development server:', error)
      }
    }
    
    startDevServer()
  }, [files])

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
