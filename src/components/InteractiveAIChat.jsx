import React, { useState, useRef, useEffect } from 'react'
import { 
  Send, Bot, User, Settings, Loader, AlertTriangle, CheckCircle, 
  FileText, Code, Brain, Globe, Zap, Sparkles, Wand2, 
  FileCode, Terminal, Play, Copy, Check, ThumbsUp, ThumbsDown,
  Mic, MicOff, Volume2, VolumeX, Shield, Lightbulb, Star,
  ArrowRight, ChevronDown, ChevronUp, MessageSquare, Heart,
  RefreshCw
} from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { callAI, AI_PROVIDERS } from '../utils/aiProviders'
import { analyzeCodebase, generateAdvancedSystemPrompt, getRelevantFiles } from '../utils/codeAnalyzer'
import TypingAnimation from './TypingAnimation'

const InteractiveAIChat = ({ aiAnalysis }) => {
  const {
    files,
    aiMessages,
    isAIProcessing,
    apiKeys,
    selectedProvider,
    addAIMessage,
    setIsAIProcessing,
    addLog,
  } = useAppStore()

  const [input, setInput] = useState('')
  const [showQuickActions, setShowQuickActions] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [currentSuggestion, setCurrentSuggestion] = useState(0)
  const [messageReactions, setMessageReactions] = useState({})
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [typingSpeed, setTypingSpeed] = useState(30)
  const [showCodePreview, setShowCodePreview] = useState(false)
  const [previewCode, setPreviewCode] = useState('')
  
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)
  const synthRef = useRef(null)
  const [isTyping, setIsTyping] = useState(false)

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }
    }

    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages, isTyping])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Auto-suggestions based on input
  useEffect(() => {
    if (input.length > 2) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }, [input])

  const generateSuggestions = (text) => {
    const suggestions = [
      "How can I optimize this code?",
      "What are the best practices for this?",
      "Can you explain this function?",
      "How can I improve performance?",
      "What are potential bugs here?",
      "Can you refactor this code?",
      "How can I add error handling?",
      "What are the security considerations?",
      "Show me a better implementation",
      "How can I make this more maintainable?"
    ]
    
    return suggestions.filter(s => 
      s.toLowerCase().includes(text.toLowerCase()) || 
      text.toLowerCase().includes(s.toLowerCase().split(' ')[0])
    ).slice(0, 4)
  }

  const handleSend = async () => {
    if (!input.trim() || isAIProcessing) return

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
      reactions: []
    }

    addAIMessage(userMessage)
    setInput('')
    setIsAIProcessing(true)
    setIsTyping(true)
    setIsStreaming(true)

    try {
      // Analyze codebase context
      const codebaseAnalysis = analyzeCodebase(files)
      const relevantFiles = getRelevantFiles(files, input)
      
      // Generate system prompt with context
      const systemPrompt = generateAdvancedSystemPrompt(codebaseAnalysis, files)
      
      // Prepare messages with context
      const messages = [
        { role: 'system', content: systemPrompt },
        ...aiMessages.slice(-10), // Keep last 10 messages for context
        userMessage
      ]

      // Simulate streaming response
      const response = await callAI(selectedProvider, messages, apiKeys[selectedProvider])
      
      // Stream the response with typing animation
      let fullResponse = ''
      const words = response.split(' ')
      
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, typingSpeed))
        fullResponse += (i > 0 ? ' ' : '') + words[i]
        setStreamingText(fullResponse)
      }

      const aiMessage = {
        role: 'assistant',
        content: fullResponse,
        timestamp: Date.now(),
        reactions: [],
        suggestions: generateResponseSuggestions(fullResponse),
        codeBlocks: extractCodeBlocks(fullResponse)
      }

      addAIMessage(aiMessage)
      
      // Auto-speak response if not muted
      if (!isMuted && synthRef.current) {
        const utterance = new SpeechSynthesisUtterance(fullResponse)
        utterance.rate = 0.9
        utterance.pitch = 1
        synthRef.current.speak(utterance)
      }

    } catch (error) {
      console.error('AI Error:', error)
      addAIMessage({
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please check your API key and try again.`,
        timestamp: Date.now(),
        reactions: [],
        isError: true
      })
    } finally {
      setIsAIProcessing(false)
      setIsTyping(false)
      setIsStreaming(false)
      setStreamingText('')
    }
  }

  const extractCodeBlocks = (text) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const matches = []
    let match
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
      matches.push({
        language: match[1] || 'javascript',
        code: match[2].trim()
      })
    }
    
    return matches
  }

  const generateResponseSuggestions = (response) => {
    const suggestions = []
    
    if (response.includes('code') || response.includes('function')) {
      suggestions.push("Show me the implementation", "Can you explain this further?")
    }
    if (response.includes('error') || response.includes('bug')) {
      suggestions.push("How can I fix this?", "What's the root cause?")
    }
    if (response.includes('optimize') || response.includes('performance')) {
      suggestions.push("Show me the optimized version", "What are the benefits?")
    }
    if (response.includes('test')) {
      suggestions.push("Write a test for this", "How can I test this?")
    }
    
    return suggestions.slice(0, 3)
  }

  const handleQuickAction = (action) => {
    const actions = {
      'optimize': 'Can you optimize this code for better performance?',
      'debug': 'Help me debug this code and find potential issues.',
      'refactor': 'Can you refactor this code to make it cleaner?',
      'explain': 'Can you explain how this code works?',
      'test': 'Help me write tests for this code.',
      'document': 'Can you add documentation to this code?',
      'security': 'Are there any security issues in this code?',
      'deploy': 'Help me deploy this application.'
    }
    
    setInput(actions[action] || action)
    inputRef.current?.focus()
  }

  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      recognitionRef.current?.start()
      setIsListening(true)
    }
  }

  const handleReaction = (messageId, reaction) => {
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), reaction]
    }))
  }

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setTimeout(() => {}, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const quickActions = [
    { id: 'optimize', label: 'Optimize', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    { id: 'debug', label: 'Debug', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/20' },
    { id: 'refactor', label: 'Refactor', icon: RefreshCw, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { id: 'explain', label: 'Explain', icon: FileText, color: 'text-green-400', bg: 'bg-green-500/20' },
    { id: 'test', label: 'Test', icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { id: 'document', label: 'Docs', icon: FileCode, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    { id: 'security', label: 'Security', icon: Shield, color: 'text-pink-400', bg: 'bg-pink-500/20' },
    { id: 'deploy', label: 'Deploy', icon: Globe, color: 'text-cyan-400', bg: 'bg-cyan-500/20' }
  ]

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-800 to-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${aiAnalysis ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}></div>
                <span className="text-sm text-slate-400">
                  {aiAnalysis ? 'Codebase Analyzed' : 'Analyzing...'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className={`p-2 rounded-lg transition-all ${
                showQuickActions 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              <Wand2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="p-2 bg-slate-700 text-slate-400 hover:bg-slate-600 rounded-lg transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      {showQuickActions && (
        <div className="p-4 border-b border-slate-700 bg-slate-800/30">
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.id)}
                className={`flex flex-col items-center space-y-2 p-3 rounded-xl transition-all hover:scale-105 ${action.bg} hover:bg-opacity-30`}
              >
                <action.icon className={`w-5 h-5 ${action.color}`} />
                <span className="text-xs font-medium text-slate-300">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {aiMessages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Welcome to AI Assistant!</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              I've analyzed your codebase and I'm ready to help you code better. 
              Ask me anything about your project!
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {quickActions.slice(0, 4).map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 ${action.bg} ${action.color}`}
                >
                  <action.icon className="w-4 h-4" />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {aiMessages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`flex items-start space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-blue-500' 
                    : 'bg-gradient-to-br from-purple-500 to-pink-500'
                }`}>
                  {message.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                
                <div className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.isError
                    ? 'bg-red-900/50 text-red-300 border border-red-500/30'
                    : 'bg-slate-700 text-slate-100'
                }`}>
                  <div className="prose prose-invert max-w-none">
                    {message.content.split('\n').map((line, i) => (
                      <p key={i} className="mb-2 last:mb-0">{line}</p>
                    ))}
                  </div>
                  
                  {/* Code Blocks */}
                  {message.codeBlocks && message.codeBlocks.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.codeBlocks.map((block, i) => (
                        <div key={i} className="bg-slate-800 rounded-lg p-3 border border-slate-600">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-slate-400">{block.language}</span>
                            <button
                              onClick={() => copyToClipboard(block.code)}
                              className="p-1 hover:bg-slate-700 rounded transition-colors"
                            >
                              <Copy className="w-3 h-3 text-slate-400" />
                            </button>
                          </div>
                          <pre className="text-sm text-slate-200 overflow-x-auto">
                            <code>{block.code}</code>
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => setInput(suggestion)}
                          className="text-xs px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded-full text-slate-300 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleReaction(index, '👍')}
                        className="p-1 hover:bg-slate-600 rounded transition-colors"
                      >
                        <ThumbsUp className="w-3 h-3 text-slate-400" />
                      </button>
                      <button
                        onClick={() => handleReaction(index, '👎')}
                        className="p-1 hover:bg-slate-600 rounded transition-colors"
                      >
                        <ThumbsDown className="w-3 h-3 text-slate-400" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(message.content)}
                        className="p-1 hover:bg-slate-600 rounded transition-colors"
                      >
                        <Copy className="w-3 h-3 text-slate-400" />
                      </button>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-700 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <Loader className="w-4 h-4 text-purple-400 animate-spin" />
                  <span className="text-slate-300">AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Streaming Response */}
        {isStreaming && streamingText && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-700 rounded-2xl px-4 py-3">
                <div className="prose prose-invert max-w-none">
                  <TypingAnimation text={streamingText} speed={typingSpeed} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/50">
        {/* Suggestions */}
        {showSuggestions && input.length > 2 && (
          <div className="mb-3 space-y-1">
            {generateSuggestions(input).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Ask me anything about your code..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleVoiceInput}
              className={`p-2 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-red-600 text-white animate-pulse' 
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-lg transition-colors ${
                isMuted 
                  ? 'bg-red-600 text-white' 
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            
            <button
              onClick={handleSend}
              disabled={!input.trim() || isAIProcessing}
              className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
    </div>
  )
}

export default InteractiveAIChat
