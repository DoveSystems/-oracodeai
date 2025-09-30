import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Settings, X, Loader, AlertTriangle, Key, CheckCircle, XCircle, FileText, Eye, Code, Brain, ExternalLink, Github, Globe, Zap } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { callAI, AI_PROVIDERS } from '../utils/aiProviders'
import { analyzeCodebase, generateAdvancedSystemPrompt, getRelevantFiles } from '../utils/codeAnalyzer'
import { parseAIResponse, createChangesSummary, streamApplyChanges } from '../utils/codeProcessor'
import { deployToNetlify, deployToVercel, deployToGitHub, validateNetlifyKey, validateVercelToken, validateGitHubToken } from '../utils/deployment'
import { cn } from '../utils/cn'

const AIChat = () => {
  const {
    files,
    aiMessages,
    isAIProcessing,
    apiKeys,
    selectedProvider,
    addAIMessage,
    setIsAIProcessing,
    setApiKey,
    setSelectedProvider,
    addLog,
    activeFile,
    setActiveFile,
  } = useAppStore()

  const [input, setInput] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showDeployment, setShowDeployment] = useState(false)
  const [pendingChanges, setPendingChanges] = useState(null)
  const [isApplyingChanges, setIsApplyingChanges] = useState(false)
  const [deploymentTokens, setDeploymentTokens] = useState({
    vercel: '',
    netlify: '',
    github: ''
  })
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // All providers now require API keys
  const needsApiKey = !apiKeys[selectedProvider]

  // API Provider Links
  const getProviderLink = (provider) => {
    const links = {
      openai: 'https://platform.openai.com/api-keys',
      anthropic: 'https://console.anthropic.com/account/keys',
      gemini: 'https://makersuite.google.com/app/apikey'
    }
    return links[provider] || '#'
  }

  // Deployment Links
  const deploymentLinks = {
    vercel: 'https://vercel.com/account/tokens',
    netlify: 'https://app.netlify.com/user/applications#personal-access-tokens',
    github: 'https://github.com/settings/tokens'
  }

  // Custom addMessage function that can replace messages
  const addMessage = (message, replace = false) => {
    if (replace && message.progressId) {
      const currentMessages = useAppStore.getState().aiMessages
      const existingIndex = currentMessages.findIndex(m => m.progressId === message.progressId)
      if (existingIndex !== -1) {
        const newMessages = [...currentMessages]
        newMessages[existingIndex] = message
        useAppStore.setState({ aiMessages: newMessages })
        return
      }
    }
    addAIMessage(message)
  }

  const handleSend = async (message = input.trim()) => {
    if (!message || isAIProcessing) return
    if (needsApiKey) {
      setShowSettings(true)
      return
    }

    const userMessage = { role: 'user', content: message }
    addAIMessage(userMessage)
    setInput('')
    setIsAIProcessing(true)

    try {
      console.log('=== ADVANCED AI REQUEST ===')
      console.log('User message:', message)
      console.log('Files available:', Object.keys(files).length)

      // Validate files structure
      const validFiles = {}
      Object.keys(files).forEach(path => {
        const file = files[path]
        if (file && typeof file === 'object' && file.content !== undefined) {
          if (typeof file.content === 'string') {
            validFiles[path] = file
          } else {
            console.warn(`File ${path} has non-string content:`, typeof file.content)
          }
        }
      })

      console.log('Valid files:', Object.keys(validFiles).length)

      // Show advanced analysis
      addAIMessage({
        role: 'assistant',
        content: `🧠 Performing deep codebase analysis...\n📁 Active file: ${activeFile || 'None'}\n🔍 Analyzing ${Object.keys(validFiles).length} files for patterns and architecture...`,
        isAnalyzing: true,
        timestamp: Date.now()
      })

      // Perform deep analysis
      const analysis = analyzeCodebase(validFiles)
      console.log('Deep analysis complete:', analysis)
      
      // Show comprehensive analysis results
      addMessage({
        role: 'assistant',
        content: `🧠 Deep Analysis Complete!\n\n📊 **Codebase Intelligence:**\n• Framework: ${analysis.framework} (${analysis.architecture})\n• Language: ${analysis.language}\n• Components: ${analysis.components.length}\n• State Management: ${analysis.codeQuality.stateManagement}\n• Styling: ${analysis.codeQuality.styling}\n• Patterns: ${analysis.patterns.join(', ') || 'Basic'}\n• Technical Debt: ${analysis.technicalDebt.length} items\n• Opportunities: ${analysis.opportunities.length} identified\n\n🎯 Crafting sophisticated solution...`,
        isAnalyzing: true,
        timestamp: Date.now()
      }, true)

      // Get comprehensive context
      const relevantFiles = getRelevantFiles(validFiles, message)
      console.log('Relevant files for context:', relevantFiles.map(f => f.path))

      // Generate advanced system prompt
      const systemPrompt = generateAdvancedSystemPrompt(analysis, validFiles)
      
      // Create sophisticated user message
      const sophisticatedMessage = `As a senior developer, please implement: ${message}

Consider the current architecture and provide a production-ready solution that:
- Follows modern best practices for ${analysis.framework}
- Integrates well with the existing ${analysis.codeQuality.stateManagement} state management
- Uses appropriate ${analysis.codeQuality.styling} styling patterns
- Includes proper error handling and loading states
- Considers performance and maintainability
- Follows the established code patterns: ${analysis.patterns.join(', ')}

Current codebase context:
${relevantFiles.map(f => `=== ${f.path} ===\n${f.content.substring(0, 1500)}${f.content.length > 1500 ? '\n... [truncated for context]' : ''}\n`).join('\n')}`

      console.log('Advanced system prompt length:', systemPrompt.length)
      console.log('Sophisticated message length:', sophisticatedMessage.length)

      // Prepare messages for advanced AI interaction
      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: sophisticatedMessage }
      ]

      console.log('Calling AI with advanced context...')

      // Call AI with sophisticated context
      const response = await callAI(
        selectedProvider,
        messages,
        apiKeys[selectedProvider],
        AI_PROVIDERS[selectedProvider].defaultModel
      )

      console.log('=== ADVANCED AI RESPONSE ===')
      console.log('Response length:', response.length)
      console.log('Response preview:', response.substring(0, 1000))

      // Parse sophisticated response
      const { explanation, changes, hasChanges, needsPermission } = parseAIResponse(response)

      console.log('=== ADVANCED PARSING COMPLETE ===')
      console.log('Has changes:', hasChanges)
      console.log('Changes count:', changes.length)
      console.log('Needs permission:', needsPermission)

      // Add sophisticated AI response
      const aiMessage = { 
        role: 'assistant', 
        content: explanation,
        hasChanges,
        needsPermission,
        changes,
        timestamp: Date.now(),
        isAdvanced: true
      }
      addAIMessage(aiMessage)

      // Handle sophisticated changes
      if (hasChanges && changes.length > 0) {
        console.log('=== PROCESSING ADVANCED CHANGES ===')
        console.log('Advanced changes to process:', changes)
        
        if (needsPermission) {
          console.log('Permission required for advanced changes')
          setPendingChanges(changes)
          addLog({ type: 'info', message: `🧠 OraCodeAI proposed ${changes.length} sophisticated changes - review and approve` })
        } else {
          console.log('Auto-applying advanced changes')
          setIsApplyingChanges(true)
          await streamApplyChanges(changes, addMessage)
          setIsApplyingChanges(false)
        }
      } else {
        console.log('=== NO ADVANCED CHANGES DETECTED ===')
        
        addAIMessage({
          role: 'assistant',
          content: `🤔 I need more specific guidance to provide a sophisticated solution for: "${message}"\n\nTo help me create production-ready code, please specify:\n\n**For UI Components:**\n• "Create a responsive navigation bar with dropdown menus"\n• "Build a data table with sorting, filtering, and pagination"\n• "Design a multi-step form with validation"\n\n**For Features:**\n• "Implement user authentication with JWT tokens"\n• "Add real-time notifications with WebSocket"\n• "Create a dashboard with charts and analytics"\n\n**For Architecture:**\n• "Refactor to use TypeScript with proper types"\n• "Add state management with Zustand"\n• "Implement error boundaries and loading states"\n\nI'll then provide enterprise-grade solutions with proper architecture, error handling, and best practices.`,
          isError: true,
          timestamp: Date.now()
        })
      }

    } catch (error) {
      console.error('=== ADVANCED AI ERROR ===', error)
      
      addAIMessage({
        role: 'assistant',
        content: `❌ I encountered an error while analyzing your codebase: ${error.message}\n\n🔧 This might be due to:\n• Missing or invalid API key\n• API rate limits\n• Network connectivity issues\n\nPlease check your API key settings and try again.`,
        isError: true,
        timestamp: Date.now()
      })
      addLog({ type: 'error', message: `OraCodeAI Error: ${error.message}` })
    } finally {
      setIsAIProcessing(false)
    }
  }

  const handleApproveChanges = async () => {
    if (!pendingChanges) return
    
    console.log('=== USER APPROVED ADVANCED CHANGES ===')
    setPendingChanges(null)
    setIsApplyingChanges(true)
    
    try {
      await streamApplyChanges(pendingChanges, addMessage)
    } catch (error) {
      console.error('Error applying advanced changes:', error)
      addAIMessage({
        role: 'assistant',
        content: `❌ Failed to apply advanced changes: ${error.message}`,
        isError: true,
        timestamp: Date.now()
      })
    } finally {
      setIsApplyingChanges(false)
    }
  }

  const handleRejectChanges = () => {
    setPendingChanges(null)
    addAIMessage({
      role: 'assistant',
      content: "❌ Advanced changes cancelled. Feel free to request a different approach or ask for modifications to the proposed solution.",
      timestamp: Date.now()
    })
    addLog({ type: 'info', message: 'Advanced changes rejected by user' })
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleDeploy = async (platform) => {
    const token = deploymentTokens[platform]
    if (!token) {
      addLog({ type: 'error', message: `Please add your ${platform} token first` })
      return
    }
    
    try {
      addLog({ type: 'info', message: `Starting deployment to ${platform}...` })
      
      // Validate token first
      let isValid = false
      switch (platform) {
        case 'netlify':
          isValid = await validateNetlifyKey(token)
          break
        case 'vercel':
          isValid = await validateVercelToken(token)
          break
        case 'github':
          isValid = await validateGitHubToken(token)
          break
      }
      
      if (!isValid) {
        throw new Error(`Invalid ${platform} token. Please check your API key.`)
      }
      
      let result
      switch (platform) {
        case 'netlify':
          result = await deployToNetlify(token, 'your-site-id', files)
          break
        case 'vercel':
          result = await deployToVercel(token, workspace?.name || 'project', files)
          break
        case 'github':
          result = await deployToGitHub(token, 'your-username/your-repo', files)
          break
        default:
          throw new Error(`Unsupported platform: ${platform}`)
      }
      
      if (result.success) {
        addLog({ type: 'success', message: result.message })
        addLog({ type: 'info', message: `Deployment URL: ${result.url}` })
        
        // Open deployment URL in new tab
        window.open(result.url, '_blank')
      }
    } catch (error) {
      console.error('Deployment error:', error)
      addLog({ type: 'error', message: `Deployment failed: ${error.message}` })
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <span className="font-medium">OraCodeAI</span>
          <span className="text-xs bg-purple-600 px-2 py-1 rounded">
            Advanced
          </span>
          <span className="text-xs bg-blue-600 px-2 py-1 rounded">
            {AI_PROVIDERS[selectedProvider].name}
          </span>
          {Object.keys(files).length > 0 && (
            <span className="text-xs bg-gray-600 px-2 py-1 rounded">
              {Object.keys(files).length} files analyzed
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDeployment(!showDeployment)}
            className="p-1 hover:bg-gray-700 rounded flex items-center space-x-1"
            title="Deployment"
          >
            <Zap className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Current Context Bar */}
      {activeFile && (
        <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700/50 flex items-center space-x-2 text-sm">
          <Eye className="w-4 h-4 text-green-400" />
          <span className="text-gray-300">Currently viewing:</span>
          <span className="text-green-400 font-mono">{activeFile}</span>
          <button
            onClick={() => setActiveFile(null)}
            className="ml-auto text-gray-400 hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* API Key Required Warning */}
      {needsApiKey && (
        <div className="bg-red-900/20 border-b border-red-600/30 px-4 py-2">
          <div className="flex items-center space-x-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-200">
              API key required for {AI_PROVIDERS[selectedProvider].name} - Click settings to add your key
            </span>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">AI Provider</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              >
                {Object.entries(AI_PROVIDERS).map(([key, provider]) => (
                  <option key={key} value={key}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">
                  API Key for {AI_PROVIDERS[selectedProvider].name}
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <a
                  href={getProviderLink(selectedProvider)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                >
                  <span>Get API Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                value={apiKeys[selectedProvider]}
                onChange={(e) => setApiKey(selectedProvider, e.target.value)}
                placeholder={`Enter your ${AI_PROVIDERS[selectedProvider].name} API key`}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                Your API key is stored locally and never sent to our servers
              </p>
              <p className="text-xs text-red-400 mt-1">
                * API key is required to use AI features
              </p>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Deployment Panel */}
      {showDeployment && (
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Deployment</span>
            </h3>
            
            {/* Vercel */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Vercel Token</label>
                <a
                  href={deploymentLinks.vercel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                >
                  <span>Get Token</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex space-x-2">
                <input
                  type="password"
                  value={deploymentTokens.vercel}
                  onChange={(e) => setDeploymentTokens(prev => ({ ...prev, vercel: e.target.value }))}
                  placeholder="Enter Vercel API token"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={() => handleDeploy('vercel')}
                  disabled={!deploymentTokens.vercel}
                  className="px-3 py-2 bg-black hover:bg-gray-800 disabled:opacity-50 rounded text-sm flex items-center space-x-1"
                >
                  <Globe className="w-4 h-4" />
                  <span>Deploy</span>
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Get your token from Vercel dashboard → Settings → Tokens
              </p>
            </div>

            {/* Netlify */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Netlify API Key</label>
                <a
                  href={deploymentLinks.netlify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                >
                  <span>Get API Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex space-x-2">
                <input
                  type="password"
                  value={deploymentTokens.netlify}
                  onChange={(e) => setDeploymentTokens(prev => ({ ...prev, netlify: e.target.value }))}
                  placeholder="Enter Netlify API key"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={() => handleDeploy('netlify')}
                  disabled={!deploymentTokens.netlify}
                  className="px-3 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded text-sm flex items-center space-x-1"
                >
                  <Globe className="w-4 h-4" />
                  <span>Deploy</span>
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Get your API key from Netlify dashboard → User settings → Applications
              </p>
            </div>

            {/* GitHub */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">GitHub Token</label>
                <a
                  href={deploymentLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                >
                  <span>Get Token</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex space-x-2">
                <input
                  type="password"
                  value={deploymentTokens.github}
                  onChange={(e) => setDeploymentTokens(prev => ({ ...prev, github: e.target.value }))}
                  placeholder="Enter GitHub access token"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={() => handleDeploy('github')}
                  disabled={!deploymentTokens.github}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded text-sm flex items-center space-x-1"
                >
                  <Github className="w-4 h-4" />
                  <span>Deploy</span>
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Get your token from GitHub → Settings → Developer settings → Personal access tokens
              </p>
            </div>

            <button
              onClick={() => setShowDeployment(false)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Pending Changes Approval */}
      {pendingChanges && !isApplyingChanges && (
        <div className="bg-purple-900/20 border-b border-purple-600/30 p-4">
          <div className="flex items-start space-x-3">
            <Brain className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-purple-200 font-medium mb-2">🧠 Advanced Changes Ready</p>
              <div className="text-sm text-purple-300 mb-3 whitespace-pre-line">
                {createChangesSummary(pendingChanges)}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleApproveChanges}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm flex items-center space-x-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Apply Advanced Changes</span>
                </button>
                <button
                  onClick={handleRejectChanges}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm flex items-center space-x-1"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-auto p-6 space-y-4">
        {aiMessages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <Brain className="w-16 h-16 mx-auto mb-4 opacity-50 text-purple-400" />
            <p className="text-xl mb-2">OraCodeAI</p>
            <p className="text-sm mb-6">
              Your senior developer AI - I analyze architecture, suggest sophisticated solutions, and write production-ready code!
            </p>
            
            {needsApiKey ? (
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-6 max-w-md mx-auto">
                <Key className="w-8 h-8 mx-auto mb-3 text-yellow-400" />
                <p className="text-yellow-200 font-medium mb-3">API Key Required</p>
                <p className="text-sm text-yellow-300 mb-4">
                  To use AI features, you need to provide your own API key from {AI_PROVIDERS[selectedProvider].name}
                </p>
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm flex items-center space-x-2 mx-auto"
                >
                  <Key className="w-4 h-4" />
                  <span>Add API Key</span>
                </button>
              </div>
            ) : (
              <div className="text-sm space-y-4 bg-gray-800 p-6 rounded-lg max-w-2xl mx-auto">
                <p className="font-medium mb-4 text-purple-400 text-lg">🧠 Advanced Capabilities:</p>
                
                <div className="grid md:grid-cols-3 gap-4 text-left">
                  <div className="space-y-2">
                    <p className="font-medium text-blue-400">🏗️ Architecture & Patterns:</p>
                    <div className="text-gray-300 space-y-1 text-sm">
                      <p>• "Refactor to use TypeScript with proper types"</p>
                      <p>• "Add state management with Zustand"</p>
                      <p>• "Implement error boundaries and loading states"</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-medium text-green-400">🚀 Advanced Features:</p>
                    <div className="text-gray-300 space-y-1 text-sm">
                      <p>• "Create user authentication with JWT"</p>
                      <p>• "Build a data table with sorting and pagination"</p>
                      <p>• "Add real-time notifications with WebSocket"</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-medium text-yellow-400">🎨 UI/UX Components:</p>
                    <div className="text-gray-300 space-y-1 text-sm">
                      <p>• "Design a responsive dashboard with charts"</p>
                      <p>• "Create a multi-step form with validation"</p>
                      <p>• "Build a navigation with dropdown menus"</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-500 mt-6 border-t border-gray-700 pt-4">
                  I provide enterprise-grade solutions with proper architecture, error handling, and best practices!
                </p>
              </div>
            )}
          </div>
        ) : (
          aiMessages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex space-x-3",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <Brain className={cn(
                    "w-6 h-6",
                    message.isError ? "text-red-400" : 
                    message.isSuccess ? "text-green-400" :
                    message.isProgress ? "text-yellow-400" :
                    message.isAnalyzing ? "text-purple-400" : 
                    message.isAdvanced ? "text-purple-400" : "text-blue-400"
                  )} />
                </div>
              )}
              
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-4 py-3 text-sm",
                  message.role === 'user'
                    ? "bg-blue-600 text-white"
                    : message.isError
                    ? "bg-red-900/50 border border-red-600/30 text-red-200"
                    : message.isSuccess
                    ? "bg-green-900/50 border border-green-600/30 text-green-200"
                    : message.isProgress
                    ? "bg-yellow-900/50 border border-yellow-600/30 text-yellow-200"
                    : message.isAnalyzing
                    ? "bg-purple-900/50 border border-purple-600/30 text-purple-200"
                    : message.isAdvanced
                    ? "bg-purple-900/30 border border-purple-600/20 text-purple-100"
                    : "bg-gray-800 border border-gray-700"
                )}
              >
                <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                  {message.content}
                </div>
                
                {message.hasChanges && message.changes && !message.isProgress && (
                  <div className="mt-4 pt-3 border-t border-gray-600">
                    <p className="text-xs text-gray-400 mb-2 font-medium">
                      🧠 Advanced changes to {message.changes.length} file(s):
                    </p>
                    <div className="text-xs space-y-1">
                      {message.changes.map((change, i) => (
                        <div key={i} className="flex items-center space-x-2 bg-gray-800/50 p-2 rounded">
                          <Code className="w-3 h-3" />
                          <span className="font-mono flex-1">{change.path}</span>
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            change.action === 'create' ? "bg-green-600 text-white" : "bg-blue-600 text-white"
                          )}>
                            {change.action}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="text-xs opacity-60 mt-3 flex items-center space-x-2">
                  <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                  {message.isAdvanced && (
                    <span className="bg-purple-600/20 px-2 py-1 rounded text-purple-300">Advanced</span>
                  )}
                </div>
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
          ))
        )}
        
        {(isAIProcessing || isApplyingChanges) && (
          <div className="flex space-x-3 justify-start">
            <Brain className="w-6 h-6 text-purple-400 flex-shrink-0" />
            <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">
                  {isApplyingChanges ? '🧠 Applying advanced changes...' : 
                   isAIProcessing ? '🔍 Performing deep analysis and crafting solution...' : 'Processing...'}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Made wider and more symmetric */}
      <div className="border-t border-gray-700 p-6">
        {needsApiKey ? (
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 text-center max-w-md mx-auto">
            <Key className="w-6 h-6 mx-auto mb-3 text-yellow-400" />
            <p className="text-sm text-yellow-200 mb-3">
              API key required for {AI_PROVIDERS[selectedProvider].name}
            </p>
            <button
              onClick={() => setShowSettings(true)}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm"
            >
              Add API Key
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe what you want me to build or improve... I'll analyze your codebase and provide sophisticated solutions!"
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-sm resize-none min-h-[80px]"
                rows={3}
                style={{ maxHeight: '150px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px'
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isAIProcessing || isApplyingChanges}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center space-x-2 self-end"
              >
                <Brain className="w-5 h-5" />
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIChat
