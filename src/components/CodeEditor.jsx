import React, { useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { File, Sparkles } from 'lucide-react'
import { useAppStore } from '../store/appStore'

const CodeEditor = () => {
  const { files, activeFile, updateFile, webcontainer } = useAppStore()
  const editorRef = useRef(null)
  const previousContentRef = useRef('')

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor
  }

  const handleEditorChange = async (value) => {
    if (!activeFile || !webcontainer) return
    
    updateFile(activeFile, value)
    
    // Write to webcontainer
    try {
      await webcontainer.fs.writeFile(activeFile, value)
    } catch (error) {
      console.error('Failed to write file:', error)
    }
  }

  const getLanguage = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    const languageMap = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      html: 'html',
      css: 'css',
      scss: 'scss',
      sass: 'scss',
      less: 'less',
      json: 'json',
      md: 'markdown',
      py: 'python',
      yml: 'yaml',
      yaml: 'yaml',
      xml: 'xml',
      svg: 'xml',
    }
    return languageMap[ext] || 'plaintext'
  }

  // Check if content was recently updated (likely by AI)
  const wasRecentlyUpdated = activeFile && files[activeFile] && 
    previousContentRef.current !== files[activeFile].content

  useEffect(() => {
    if (activeFile && files[activeFile]) {
      previousContentRef.current = files[activeFile].content
    }
  }, [activeFile, files])

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <File className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">Select a file to edit</p>
          <p className="text-sm">Choose a file from the file tree to start editing</p>
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg max-w-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-200">AI Tip</span>
            </div>
            <p className="text-xs text-blue-300">
              Use the AI Assistant to automatically modify your code. 
              Changes will appear here in real-time!
            </p>
          </div>
        </div>
      </div>
    )
  }

  const file = files[activeFile]
  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <File className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>File not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col flex-constrained">
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2 min-w-0">
          <span className="text-sm font-medium truncate">{activeFile}</span>
          {wasRecentlyUpdated && (
            <div className="flex items-center space-x-1 bg-green-600/20 px-2 py-1 rounded text-xs flex-shrink-0">
              <Sparkles className="w-3 h-3 text-green-400" />
              <span className="text-green-300">AI Updated</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <span className="text-xs text-gray-400">
            {getLanguage(activeFile)}
          </span>
          <div className="w-2 h-2 bg-green-500 rounded-full" title="Live preview active"></div>
        </div>
      </div>
      <div className="flex-1 relative flex-constrained">
        <Editor
          height="100%"
          language={getLanguage(activeFile)}
          value={file.content}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            folding: true,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 3,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            renderLineHighlight: 'all',
            selectOnLineNumbers: true,
            matchBrackets: 'always',
            autoIndent: 'full',
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
        
        {/* Real-time update indicator */}
        {wasRecentlyUpdated && (
          <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs flex items-center space-x-1 animate-pulse">
            <Sparkles className="w-3 h-3" />
            <span>Live Update</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default CodeEditor
