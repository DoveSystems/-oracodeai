import React, { useState, useRef } from 'react'
import { useAppStore } from '../store/appStore'
import { Brain, Send, Loader, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const SimpleAIChat = ({ aiAnalysis }) => {
  const navigate = useNavigate()
  const { 
    aiMessages, 
    addAIMessage, 
    isAIProcessing, 
    setIsAIProcessing,
    apiKeys,
    selectedProvider
  } = useAppStore()
  
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  const handleSend = async () => {
    if (!input.trim() || isAIProcessing) return

    const userMessage = input.trim()
    setInput('')
    
    // Add user message
    addAIMessage({ role: 'user', content: userMessage })
    setIsAIProcessing(true)

    // Check if API key is configured
    if (!apiKeys[selectedProvider]) {
      addAIMessage({ 
        role: 'assistant', 
        content: `Sorry, I need an API key to work. Please configure your ${selectedProvider} API key in settings.`,
        isError: true
      })
      setIsAIProcessing(false)
      return
    }

    // Simulate AI response
    setTimeout(() => {
      addAIMessage({ 
        role: 'assistant', 
        content: `I understand you're asking about "${userMessage}". I'm ready to help with your code! Configure your API key in settings to get full AI assistance.`
      })
      setIsAIProcessing(false)
    }, 1500)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Simple Header */}
      <div className="p-3 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Brain className="w-3 h-3 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
              <div className="flex items-center space-x-1">
                <div className={`w-1.5 h-1.5 rounded-full ${apiKeys[selectedProvider] ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-xs text-slate-400">
                  {apiKeys[selectedProvider] ? 'Ready' : 'API Key Required'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="p-1.5 bg-slate-700 text-slate-400 hover:bg-slate-600 rounded text-xs transition-colors"
          >
            <Settings className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {aiMessages.length === 0 && (
          <div className="text-center py-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">AI Assistant Ready</h3>
            <p className="text-xs text-slate-400 mb-3">
              Ask me anything about your project!
            </p>
            {!apiKeys[selectedProvider] && (
              <button
                onClick={() => navigate('/settings')}
                className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded transition-colors"
              >
                Configure API Key
              </button>
            )}
          </div>
        )}

        {aiMessages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`flex items-start space-x-2 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-blue-600' 
                    : message.isError 
                      ? 'bg-red-600' 
                      : 'bg-gradient-to-br from-purple-500 to-pink-500'
                }`}>
                  {message.role === 'user' ? (
                    <span className="text-xs text-white">U</span>
                  ) : (
                    <Brain className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className={`px-3 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.isError
                      ? 'bg-red-600/20 text-red-300 border border-red-500/30'
                      : 'bg-slate-700 text-slate-200'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isAIProcessing && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Brain className="w-3 h-3 text-white" />
              </div>
              <div className="bg-slate-700 text-slate-200 px-3 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Loader className="w-3 h-3 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Simple Input */}
      <div className="p-3 bg-slate-800 border-t border-slate-700">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isAIProcessing}
            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAIProcessing ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SimpleAIChat
