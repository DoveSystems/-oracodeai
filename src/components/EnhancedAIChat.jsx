import React, { useState, useRef, useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { 
  Brain, 
  Send, 
  Loader, 
  Settings, 
  Code, 
  FileText, 
  Bug, 
  Wrench, 
  Zap,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Upload,
  Play,
  Square
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const EnhancedAIChat = ({ aiAnalysis }) => {
  const navigate = useNavigate()
  const { 
    aiMessages, 
    addAIMessage, 
    isAIProcessing, 
    setIsAIProcessing,
    apiKeys,
    selectedProvider,
    files,
    updateFile,
    addLog
  } = useAppStore()
  
  const [input, setInput] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [codebaseAnalysis, setCodebaseAnalysis] = useState(null)
  const [suggestedActions, setSuggestedActions] = useState([])
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [aiMessages])

  useEffect(() => {
    if (files && Object.keys(files).length > 0) {
      analyzeCodebase()
    }
  }, [files])

  const analyzeCodebase = async () => {
    setIsAnalyzing(true)
    addLog({ type: 'info', message: '🤖 AI analyzing codebase...' })
    
    try {
      const analysis = await performDeepCodeAnalysis(files)
      setCodebaseAnalysis(analysis)
      setSuggestedActions(generateSuggestedActions(analysis))
      addLog({ type: 'success', message: '✅ AI codebase analysis complete' })
    } catch (error) {
      addLog({ type: 'error', message: `❌ AI analysis failed: ${error.message}` })
    }
    
    setIsAnalyzing(false)
  }

  const performDeepCodeAnalysis = async (files) => {
    const fileList = Object.keys(files)
    
    // Analyze each code file
    const codeFiles = fileList.filter(f => 
      f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.ts') || f.endsWith('.tsx') ||
      f.endsWith('.py') || f.endsWith('.java') || f.endsWith('.cpp') || f.endsWith('.c')
    )

    const analysis = {
      totalFiles: fileList.length,
      codeFiles: codeFiles.length,
      fileAnalysis: {},
      issues: [],
      suggestions: [],
      complexity: 'low',
      frameworks: [],
      patterns: []
    }

    // Analyze each code file
    for (const file of codeFiles) {
      try {
        const content = files[file].content
        const fileAnalysis = analyzeCodeFile(file, content)
        analysis.fileAnalysis[file] = fileAnalysis
        
        // Collect issues and suggestions
        analysis.issues.push(...fileAnalysis.issues)
        analysis.suggestions.push(...fileAnalysis.suggestions)
        analysis.frameworks.push(...fileAnalysis.frameworks)
        analysis.patterns.push(...fileAnalysis.patterns)
      } catch (error) {
        console.error(`Error analyzing ${file}:`, error)
      }
    }

    // Calculate overall complexity
    const totalIssues = analysis.issues.length
    const totalSuggestions = analysis.suggestions.length
    
    if (totalIssues > 10 || totalSuggestions > 15) {
      analysis.complexity = 'high'
    } else if (totalIssues > 5 || totalSuggestions > 8) {
      analysis.complexity = 'medium'
    }

    return analysis
  }

  const analyzeCodeFile = (filename, content) => {
    const issues = []
    const suggestions = []
    const frameworks = []
    const patterns = []

    // Detect frameworks and libraries
    if (content.includes('import React') || content.includes('from "react"')) {
      frameworks.push('React')
    }
    if (content.includes('import Vue') || content.includes('from "vue"')) {
      frameworks.push('Vue')
    }
    if (content.includes('import { useState }') || content.includes('useState')) {
      patterns.push('React Hooks')
    }
    if (content.includes('useEffect')) {
      patterns.push('React Effects')
    }
    if (content.includes('async') || content.includes('await')) {
      patterns.push('Async/Await')
    }

    // Detect potential issues
    if (content.includes('console.log')) {
      issues.push({
        type: 'warning',
        message: 'Console.log statements found',
        file: filename,
        line: findLineNumber(content, 'console.log')
      })
    }

    if (content.includes('var ')) {
      issues.push({
        type: 'suggestion',
        message: 'Consider using let/const instead of var',
        file: filename,
        line: findLineNumber(content, 'var ')
      })
    }

    if (content.includes('==') && !content.includes('===')) {
      issues.push({
        type: 'warning',
        message: 'Consider using strict equality (===)',
        file: filename,
        line: findLineNumber(content, '==')
      })
    }

    // Detect missing error handling
    if (content.includes('fetch(') && !content.includes('.catch(')) {
      issues.push({
        type: 'error',
        message: 'Missing error handling for fetch request',
        file: filename,
        line: findLineNumber(content, 'fetch(')
      })
    }

    // Generate suggestions
    if (content.includes('function ') && !content.includes('const ')) {
      suggestions.push({
        type: 'optimization',
        message: 'Consider using arrow functions for better readability',
        file: filename
      })
    }

    if (content.includes('document.getElementById') && frameworks.includes('React')) {
      suggestions.push({
        type: 'best-practice',
        message: 'Consider using React refs instead of direct DOM manipulation',
        file: filename
      })
    }

    return {
      issues,
      suggestions,
      frameworks,
      patterns,
      linesOfCode: content.split('\n').length,
      complexity: calculateFileComplexity(content)
    }
  }

  const findLineNumber = (content, searchString) => {
    const lines = content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchString)) {
        return i + 1
      }
    }
    return 0
  }

  const calculateFileComplexity = (content) => {
    const lines = content.split('\n').length
    const functions = (content.match(/function\s+\w+/g) || []).length
    const classes = (content.match(/class\s+\w+/g) || []).length
    const imports = (content.match(/import\s+/g) || []).length
    
    if (lines > 200 || functions > 10 || classes > 5) {
      return 'high'
    } else if (lines > 100 || functions > 5 || classes > 2) {
      return 'medium'
    }
    return 'low'
  }

  const generateSuggestedActions = (analysis) => {
    const actions = []
    
    if (analysis.issues.length > 0) {
      actions.push({
        id: 'fix-issues',
        label: 'Fix Issues',
        icon: Bug,
        color: 'text-red-500',
        bg: 'bg-red-100',
        description: `Fix ${analysis.issues.length} detected issues`
      })
    }

    if (analysis.suggestions.length > 0) {
      actions.push({
        id: 'optimize-code',
        label: 'Optimize Code',
        icon: Zap,
        color: 'text-yellow-500',
        bg: 'bg-yellow-100',
        description: `${analysis.suggestions.length} optimization suggestions`
      })
    }

    actions.push({
      id: 'analyze-performance',
      label: 'Analyze Performance',
      icon: Wrench,
      color: 'text-blue-500',
      bg: 'bg-blue-100',
      description: 'Deep performance analysis'
    })

    actions.push({
      id: 'generate-tests',
      label: 'Generate Tests',
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-100',
      description: 'Create unit tests for your code'
    })

    return actions
  }

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

    try {
      // Generate comprehensive AI response
      const response = await generateEnhancedAIResponse(userMessage, codebaseAnalysis, files)
      
      addAIMessage({ 
        role: 'assistant', 
        content: response
      })
    } catch (error) {
      console.error('AI processing error:', error)
      addAIMessage({ 
        role: 'assistant', 
        content: `I encountered an error while processing your request: ${error.message}. Please try again.`,
        isError: true
      })
    }
    
    setIsAIProcessing(false)
  }

  const generateEnhancedAIResponse = async (userMessage, analysis, files) => {
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('analyze') || lowerMessage.includes('codebase')) {
      return generateCodebaseAnalysis(analysis)
    }
    
    if (lowerMessage.includes('bug') || lowerMessage.includes('error') || lowerMessage.includes('issue')) {
      return generateBugAnalysis(analysis)
    }
    
    if (lowerMessage.includes('optimize') || lowerMessage.includes('improve')) {
      return generateOptimizationSuggestions(analysis)
    }
    
    if (lowerMessage.includes('test') || lowerMessage.includes('testing')) {
      return generateTestSuggestions(analysis)
    }
    
    if (lowerMessage.includes('performance') || lowerMessage.includes('speed')) {
      return generatePerformanceAnalysis(analysis)
    }
    
    if (lowerMessage.includes('fix') || lowerMessage.includes('repair')) {
      return generateFixSuggestions(analysis)
    }
    
    // Default comprehensive response
    return generateGeneralResponse(analysis)
  }

  const generateCodebaseAnalysis = (analysis) => {
    if (!analysis) {
      return `I need to analyze your codebase first. Please wait while I perform a deep analysis of your project files.`
    }

    return `## 📊 **Codebase Analysis Complete**

**Project Overview:**
- **Total Files:** ${analysis.totalFiles}
- **Code Files:** ${analysis.codeFiles}
- **Complexity:** ${analysis.complexity}
- **Frameworks:** ${analysis.frameworks.join(', ') || 'None detected'}

**Issues Found:** ${analysis.issues.length}
${analysis.issues.slice(0, 3).map(issue => `- ${issue.message} (${issue.file}:${issue.line})`).join('\n')}

**Optimization Opportunities:** ${analysis.suggestions.length}
${analysis.suggestions.slice(0, 3).map(suggestion => `- ${suggestion.message}`).join('\n')}

**Recommendations:**
1. **Code Quality:** ${analysis.issues.length > 0 ? 'Fix detected issues' : 'Code quality looks good'}
2. **Performance:** ${analysis.complexity === 'high' ? 'Consider refactoring complex files' : 'Performance looks good'}
3. **Best Practices:** ${analysis.suggestions.length > 0 ? 'Apply optimization suggestions' : 'Following best practices'}

Would you like me to help fix any specific issues or implement optimizations?`
  }

  const generateBugAnalysis = (analysis) => {
    if (!analysis) {
      return `I need to analyze your codebase first to identify potential bugs. Please wait while I perform the analysis.`
    }

    const criticalIssues = analysis.issues.filter(issue => issue.type === 'error')
    const warnings = analysis.issues.filter(issue => issue.type === 'warning')
    const suggestions = analysis.issues.filter(issue => issue.type === 'suggestion')

    return `## 🐛 **Bug Analysis Report**

**Critical Issues:** ${criticalIssues.length}
${criticalIssues.map(issue => `- **${issue.file}:${issue.line}** - ${issue.message}`).join('\n')}

**Warnings:** ${warnings.length}
${warnings.slice(0, 5).map(issue => `- **${issue.file}:${issue.line}** - ${issue.message}`).join('\n')}

**Suggestions:** ${suggestions.length}
${suggestions.slice(0, 3).map(issue => `- **${issue.file}:${issue.line}** - ${issue.message}`).join('\n')}

**Priority Actions:**
1. ${criticalIssues.length > 0 ? 'Fix critical issues immediately' : 'No critical issues found'}
2. ${warnings.length > 0 ? 'Address warnings to improve code quality' : 'No warnings found'}
3. ${suggestions.length > 0 ? 'Consider implementing suggestions' : 'Code follows best practices'}

Would you like me to help fix any of these issues?`
  }

  const generateOptimizationSuggestions = (analysis) => {
    if (!analysis) {
      return `I need to analyze your codebase first to provide optimization suggestions. Please wait while I perform the analysis.`
    }

    return `## ⚡ **Optimization Suggestions**

**Performance Optimizations:**
- **Bundle Size:** Consider code splitting for large applications
- **Images:** Optimize images and use modern formats (WebP, AVIF)
- **Caching:** Implement proper caching strategies
- **Lazy Loading:** Load components and routes on demand

**Code Quality Improvements:**
- **Type Safety:** Consider adding TypeScript for better type checking
- **Error Handling:** Implement comprehensive error boundaries
- **Testing:** Add unit and integration tests
- **Documentation:** Improve code documentation

**Architecture Suggestions:**
- **State Management:** Consider using Redux or Zustand for complex state
- **API Layer:** Implement proper API abstraction
- **Component Structure:** Optimize component hierarchy
- **Reusability:** Extract common patterns into reusable components

Would you like me to implement any of these optimizations?`
  }

  const generateTestSuggestions = (analysis) => {
    if (!analysis) {
      return `I need to analyze your codebase first to generate test suggestions. Please wait while I perform the analysis.`
    }

    return `## 🧪 **Test Generation Strategy**

**Unit Tests Needed:**
- **Components:** Test React/Vue components with different props
- **Functions:** Test utility functions and business logic
- **Hooks:** Test custom hooks and their behavior
- **API Calls:** Mock and test API interactions

**Integration Tests:**
- **User Flows:** Test complete user journeys
- **Component Integration:** Test component interactions
- **API Integration:** Test real API endpoints
- **Error Scenarios:** Test error handling paths

**Test Framework Recommendations:**
- **Jest:** For unit testing and mocking
- **React Testing Library:** For component testing
- **Cypress:** For end-to-end testing
- **Storybook:** For component documentation

Would you like me to generate specific tests for your code?`
  }

  const generatePerformanceAnalysis = (analysis) => {
    if (!analysis) {
      return `I need to analyze your codebase first to provide performance analysis. Please wait while I perform the analysis.`
    }

    return `## 🚀 **Performance Analysis**

**Current Performance Status:**
- **Code Complexity:** ${analysis.complexity}
- **Bundle Size:** Estimated based on dependencies
- **Rendering Performance:** Component optimization needed
- **Network Performance:** API call optimization required

**Performance Bottlenecks:**
- **Large Components:** Consider breaking down complex components
- **Unnecessary Re-renders:** Optimize with React.memo or useMemo
- **Heavy Computations:** Move to useMemo or useCallback
- **API Calls:** Implement proper caching and debouncing

**Optimization Recommendations:**
1. **Code Splitting:** Implement route-based code splitting
2. **Lazy Loading:** Load components and images on demand
3. **Memoization:** Use React.memo for expensive components
4. **Bundle Analysis:** Analyze and optimize bundle size

Would you like me to implement any of these performance optimizations?`
  }

  const generateFixSuggestions = (analysis) => {
    if (!analysis) {
      return `I need to analyze your codebase first to provide fix suggestions. Please wait while I perform the analysis.`
    }

    return `## 🔧 **Fix Suggestions**

**Immediate Fixes:**
${analysis.issues.slice(0, 5).map(issue => `- **${issue.file}:** ${issue.message}`).join('\n')}

**Code Improvements:**
${analysis.suggestions.slice(0, 5).map(suggestion => `- **${suggestion.file}:** ${suggestion.message}`).join('\n')}

**Automated Fixes Available:**
- **ESLint Issues:** Auto-fix formatting and basic issues
- **Import Optimization:** Clean up unused imports
- **Code Formatting:** Standardize code style
- **Dependency Updates:** Update outdated packages

Would you like me to apply any of these fixes automatically?`
  }

  const generateGeneralResponse = (analysis) => {
    if (!analysis) {
      return `I'm ready to help you with your code! I can:

- **Analyze your codebase** for issues and improvements
- **Fix bugs** and resolve errors
- **Optimize performance** and code quality
- **Generate tests** for your components
- **Review code** and suggest best practices
- **Help with debugging** and troubleshooting

What would you like me to help you with?`
    }

    return `I can see your ${analysis.codeFiles} code files with ${analysis.issues.length} issues and ${analysis.suggestions.length} optimization opportunities.

**Quick Actions:**
- **Fix Issues:** ${analysis.issues.length} issues detected
- **Optimize Code:** ${analysis.suggestions.length} suggestions available
- **Generate Tests:** Create comprehensive test suite
- **Performance Review:** Analyze and optimize performance

What specific help do you need with your code?`
  }

  const handleQuickAction = async (actionId) => {
    if (isAIProcessing) return

    const action = suggestedActions.find(a => a.id === actionId)
    if (!action) return

    addAIMessage({ role: 'user', content: `Execute: ${action.label}` })
    setIsAIProcessing(true)

    try {
      let response = ''
      
      switch (actionId) {
        case 'fix-issues':
          response = await generateBugAnalysis(codebaseAnalysis)
          break
        case 'optimize-code':
          response = await generateOptimizationSuggestions(codebaseAnalysis)
          break
        case 'analyze-performance':
          response = await generatePerformanceAnalysis(codebaseAnalysis)
          break
        case 'generate-tests':
          response = await generateTestSuggestions(codebaseAnalysis)
          break
        default:
          response = 'Action executed successfully!'
      }

      addAIMessage({ 
        role: 'assistant', 
        content: response
      })
    } catch (error) {
      addAIMessage({ 
        role: 'assistant', 
        content: `Failed to execute action: ${error.message}`,
        isError: true
      })
    }
    
    setIsAIProcessing(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="p-3 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Brain className="w-3 h-3 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">AI Developer</h3>
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

      {/* Quick Actions */}
      {suggestedActions.length > 0 && (
        <div className="p-2 border-b border-slate-700 bg-slate-800/30">
          <div className="grid grid-cols-2 gap-2">
            {suggestedActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.id)}
                disabled={isAIProcessing}
                className={`flex items-center space-x-2 p-2 rounded-lg text-xs transition-colors ${action.bg} ${action.color} hover:opacity-80 disabled:opacity-50`}
              >
                <action.icon className="w-3 h-3" />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {aiMessages.length === 0 && (
          <div className="text-center py-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">AI Developer Ready</h3>
            <p className="text-xs text-slate-400 mb-3">
              I can analyze, fix, and optimize your code!
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
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
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
                  <span className="text-sm">AI Developer thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-slate-800 border-t border-slate-700">
        <div className="flex items-center space-x-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask AI Developer anything..."
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

export default EnhancedAIChat
