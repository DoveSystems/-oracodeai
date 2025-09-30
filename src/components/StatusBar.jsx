import React from 'react'
import { useAppStore } from '../store/appStore'
import { Play, Square, Download, Share, Terminal, X, Bot, Save } from 'lucide-react'
import { cn } from '../utils/cn'
import { restartProject, downloadProject, createBackup } from '../utils/projectActions'

const StatusBar = () => {
  const { workspace, status, showLogs, setShowLogs, showAIChat, setShowAIChat, reset } = useAppStore()

  const getStatusColor = () => {
    switch (status) {
      case 'running': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      case 'installing':
      case 'building': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'running': return 'Running'
      case 'error': return 'Error'
      case 'installing': return 'Installing'
      case 'building': return 'Building'
      case 'uploading': return 'Uploading'
      default: return 'Idle'
    }
  }

  return (
    <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 border-b border-gray-600 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className={cn("w-3 h-3 rounded-full shadow-sm", getStatusColor())}></div>
          <span className="text-sm font-semibold text-white">{workspace?.name}</span>
          <span className="text-xs text-gray-300 bg-gray-600/50 px-2 py-1 rounded-full">{getStatusText()}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={createBackup}
          className="px-3 py-2 bg-gray-600/80 hover:bg-gray-500/80 rounded-lg text-sm flex items-center space-x-1 font-medium transition-all duration-200 hover:scale-105"
          title="Create backup before making changes"
        >
          <Save className="w-4 h-4" />
          <span>Backup</span>
        </button>

        <button
          onClick={restartProject}
          disabled={status === 'installing' || status === 'building'}
          className="px-3 py-2 bg-blue-600/80 hover:bg-blue-500/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm flex items-center space-x-1 font-medium transition-all duration-200 hover:scale-105"
        >
          <Play className="w-4 h-4" />
          <span>Restart</span>
        </button>

        <button
          onClick={downloadProject}
          className="px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg text-sm flex items-center space-x-1 font-medium transition-all duration-200 hover:scale-105 shadow-lg"
          title="Download project with all changes"
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </button>

        <button
          onClick={reset}
          className="px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg text-sm flex items-center space-x-1 font-medium transition-all duration-200 hover:scale-105 shadow-lg"
        >
          <X className="w-4 h-4" />
          <span>Close</span>
        </button>
      </div>
    </div>
  )
}

export default StatusBar
