import React, { useState, useEffect } from 'react'
import { File, Folder, FolderOpen, ChevronRight, ChevronDown, Sparkles } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { cn } from '../utils/cn'

const FileTree = () => {
  const { files, activeFile, setActiveFile } = useAppStore()
  const [expandedFolders, setExpandedFolders] = useState(new Set(['']))
  const [recentlyUpdated, setRecentlyUpdated] = useState(new Set())

  // Track recently updated files
  useEffect(() => {
    const updated = new Set()
    Object.keys(files).forEach(path => {
      // Simple heuristic: if file was updated in last 5 seconds
      const file = files[path]
      if (file.lastModified && Date.now() - file.lastModified < 5000) {
        updated.add(path)
      }
    })
    setRecentlyUpdated(updated)
    
    // Clear indicators after 5 seconds
    const timer = setTimeout(() => {
      setRecentlyUpdated(new Set())
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [files])

  const buildTree = (files) => {
    const tree = {}
    
    Object.keys(files).forEach(path => {
      const parts = path.split('/')
      let current = tree
      
      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = {
            name: part,
            path: parts.slice(0, index + 1).join('/'),
            isFile: index === parts.length - 1,
            children: {}
          }
        }
        current = current[part].children
      })
    })
    
    return tree
  }

  const toggleFolder = (path) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedFolders(newExpanded)
  }

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    const iconMap = {
      js: '🟨',
      jsx: '⚛️',
      ts: '🔷',
      tsx: '⚛️',
      html: '🌐',
      css: '🎨',
      scss: '🎨',
      json: '📋',
      md: '📝',
      py: '🐍',
      yml: '⚙️',
      yaml: '⚙️',
    }
    return iconMap[ext] || '📄'
  }

  const renderTree = (tree, level = 0) => {
    return Object.values(tree)
      .sort((a, b) => {
        // Folders first, then files
        if (!a.isFile && b.isFile) return -1
        if (a.isFile && !b.isFile) return 1
        return a.name.localeCompare(b.name)
      })
      .map(node => (
        <div key={node.path}>
          <div
            className={cn(
              "flex items-center px-2 py-1 hover:bg-gray-700 cursor-pointer text-sm select-none relative",
              activeFile === node.path && "bg-blue-600",
              recentlyUpdated.has(node.path) && "bg-green-900/30 border-l-2 border-green-400",
              "pl-" + (2 + level * 4)
            )}
            style={{ paddingLeft: `${8 + level * 16}px` }}
            onClick={() => {
              if (node.isFile) {
                setActiveFile(node.path)
              } else {
                toggleFolder(node.path)
              }
            }}
          >
            {!node.isFile && (
              <span className="mr-1">
                {expandedFolders.has(node.path) ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </span>
            )}
            
            {node.isFile ? (
              <div className="flex items-center space-x-2 flex-1">
                <span className="text-sm">{getFileIcon(node.name)}</span>
                <span className="truncate">{node.name}</span>
                {recentlyUpdated.has(node.path) && (
                  <Sparkles className="w-3 h-3 text-green-400 animate-pulse" />
                )}
              </div>
            ) : expandedFolders.has(node.path) ? (
              <div className="flex items-center space-x-2 flex-1">
                <FolderOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="truncate">{node.name}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 flex-1">
                <Folder className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="truncate">{node.name}</span>
              </div>
            )}
          </div>
          
          {!node.isFile && expandedFolders.has(node.path) && Object.keys(node.children).length > 0 && (
            <div>
              {renderTree(node.children, level + 1)}
            </div>
          )}
        </div>
      ))
  }

  const tree = buildTree(files)
  const fileCount = Object.keys(files).length
  const updatedCount = recentlyUpdated.size

  return (
    <div className="h-full overflow-auto">
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Files ({fileCount})</h3>
          {updatedCount > 0 && (
            <div className="flex items-center space-x-1 bg-green-600/20 px-2 py-1 rounded text-xs">
              <Sparkles className="w-3 h-3 text-green-400" />
              <span className="text-green-300">{updatedCount} updated</span>
            </div>
          )}
        </div>
      </div>
      <div className="p-2">
        {Object.keys(tree).length > 0 ? (
          renderTree(tree)
        ) : (
          <div className="text-gray-500 text-sm p-4 text-center">
            No files loaded
          </div>
        )}
      </div>
    </div>
  )
}

export default FileTree
