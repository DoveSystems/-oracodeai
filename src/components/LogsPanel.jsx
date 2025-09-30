import React, { useEffect, useRef } from 'react'
import { useAppStore } from '../store/appStore'
import { Terminal, X, RotateCcw } from 'lucide-react'
import { cn } from '../utils/cn'

const LogsPanel = () => {
  const { logs, clearLogs, setShowLogs } = useAppStore()
  const logsEndRef = useRef(null)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const getLogColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-400'
      case 'warning': return 'text-yellow-400'
      case 'success': return 'text-green-400'
      case 'info': return 'text-blue-400'
      default: return 'text-gray-300'
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 flex-constrained">
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4" />
          <span className="text-sm font-medium">Logs</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearLogs}
            className="p-1 hover:bg-gray-700 rounded"
            title="Clear logs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowLogs(false)}
            className="p-1 hover:bg-gray-700 rounded"
            title="Hide logs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 font-mono text-sm flex-constrained">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No logs yet. Logs will appear here when you start working with your project.
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className={cn("mb-1", getLogColor(log.type))}>
              <span className="text-gray-500 text-xs mr-2">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              {log.message}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  )
}

export default LogsPanel
