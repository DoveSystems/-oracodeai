export function analyzeCodebase(files) {
  const analysis = {
    framework: 'unknown',
    language: 'javascript',
    architecture: 'unknown',
    patterns: [],
    structure: {},
    dependencies: [],
    entryPoints: [],
    components: [],
    hooks: [],
    utilities: [],
    styles: [],
    totalFiles: Object.keys(files).length,
    fileTypes: {},
    mainFiles: {},
    codeQuality: {
      hasTypeScript: false,
      hasTests: false,
      hasLinting: false,
      hasFormatting: false,
      componentStructure: 'basic',
      stateManagement: 'none',
      styling: 'css'
    },
    technicalDebt: [],
    opportunities: []
  }

  // Count file types and detect patterns
  Object.keys(files).forEach(path => {
    const ext = path.split('.').pop()?.toLowerCase()
    analysis.fileTypes[ext] = (analysis.fileTypes[ext] || 0) + 1
    
    // Detect technical patterns
    if (path.includes('test') || path.includes('spec')) analysis.codeQuality.hasTests = true
    if (path.includes('.ts') || path.includes('.tsx')) analysis.codeQuality.hasTypeScript = true
    if (path.includes('eslint') || path.includes('.eslintrc')) analysis.codeQuality.hasLinting = true
    if (path.includes('prettier')) analysis.codeQuality.hasFormatting = true
    if (path.includes('hook') || path.includes('use')) analysis.hooks.push(path)
    if (path.includes('util') || path.includes('helper')) analysis.utilities.push(path)
    if (path.includes('.css') || path.includes('.scss') || path.includes('.module')) analysis.styles.push(path)
  })

  // Deep package.json analysis
  if (files['package.json']) {
    try {
      const pkgContent = files['package.json'].content
      if (typeof pkgContent === 'string') {
        const pkg = JSON.parse(pkgContent)
        analysis.dependencies = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })
        analysis.mainFiles['package.json'] = pkg
        
        // Advanced framework detection
        if (pkg.dependencies?.next || pkg.devDependencies?.next) {
          analysis.framework = 'nextjs'
          analysis.architecture = 'full-stack'
        } else if (pkg.dependencies?.vite || pkg.devDependencies?.vite) {
          analysis.framework = 'vite'
          analysis.architecture = 'spa'
        } else if (pkg.dependencies?.['@sveltejs/kit']) {
          analysis.framework = 'sveltekit'
          analysis.architecture = 'full-stack'
        } else if (pkg.dependencies?.astro) {
          analysis.framework = 'astro'
          analysis.architecture = 'static'
        } else if (pkg.dependencies?.['react-scripts']) {
          analysis.framework = 'cra'
          analysis.architecture = 'spa'
        } else if (pkg.dependencies?.react) {
          analysis.framework = 'react'
          analysis.architecture = 'library'
        }
        
        // State management detection
        if (pkg.dependencies?.redux || pkg.dependencies?.['@reduxjs/toolkit']) {
          analysis.codeQuality.stateManagement = 'redux'
        } else if (pkg.dependencies?.zustand) {
          analysis.codeQuality.stateManagement = 'zustand'
        } else if (pkg.dependencies?.jotai) {
          analysis.codeQuality.stateManagement = 'jotai'
        } else if (pkg.dependencies?.recoil) {
          analysis.codeQuality.stateManagement = 'recoil'
        }
        
        // Styling approach detection
        if (pkg.dependencies?.['styled-components'] || pkg.dependencies?.emotion) {
          analysis.codeQuality.styling = 'css-in-js'
        } else if (pkg.dependencies?.tailwindcss) {
          analysis.codeQuality.styling = 'tailwind'
        } else if (pkg.dependencies?.sass || pkg.dependencies?.scss) {
          analysis.codeQuality.styling = 'sass'
        }
      }
    } catch (e) {
      console.warn('Failed to parse package.json:', e)
    }
  }

  // Analyze key files with deep inspection
  const keyFiles = [
    'index.html', 'src/App.jsx', 'src/App.tsx', 'src/main.jsx', 'src/main.tsx', 
    'src/index.js', 'src/index.css', 'src/App.css', 'vite.config.js', 'tsconfig.json',
    'tailwind.config.js', 'README.md'
  ]
  
  keyFiles.forEach(file => {
    if (files[file] && files[file].content) {
      const content = files[file].content
      if (typeof content === 'string') {
        analysis.mainFiles[file] = content
        
        // Analyze code patterns in key files
        if (file.includes('App.jsx') || file.includes('App.tsx')) {
          if (content.includes('useState')) analysis.patterns.push('react-hooks')
          if (content.includes('useEffect')) analysis.patterns.push('side-effects')
          if (content.includes('useContext')) analysis.patterns.push('context-api')
          if (content.includes('className=')) analysis.patterns.push('css-classes')
          if (content.includes('styled.')) analysis.patterns.push('styled-components')
          if (content.includes('tw-')) analysis.patterns.push('tailwind')
        }
      }
    }
  })

  // Analyze component structure
  Object.keys(files).forEach(path => {
    const parts = path.split('/')
    const fileName = parts[parts.length - 1]
    const ext = fileName.split('.').pop()?.toLowerCase()

    if (['ts', 'tsx'].includes(ext)) analysis.language = 'typescript'

    // Find entry points
    if (['index.html', 'index.js', 'index.jsx', 'index.ts', 'index.tsx', 'main.js', 'main.jsx', 'main.ts', 'main.tsx', 'App.js', 'App.jsx', 'App.ts', 'App.tsx'].includes(fileName)) {
      analysis.entryPoints.push(path)
    }

    // Find components with structure analysis
    if (['jsx', 'tsx', 'vue', 'svelte'].includes(ext) && !path.includes('node_modules')) {
      analysis.components.push(path)
      
      // Determine component structure
      if (path.includes('components/') && path.includes('/index.')) {
        analysis.codeQuality.componentStructure = 'barrel-exports'
      } else if (path.includes('components/') && parts.length > 3) {
        analysis.codeQuality.componentStructure = 'nested'
      }
    }
  })

  // Identify technical debt and opportunities
  if (!analysis.codeQuality.hasTypeScript && analysis.components.length > 5) {
    analysis.technicalDebt.push('No TypeScript - consider migration for better type safety')
  }
  
  if (!analysis.codeQuality.hasTests) {
    analysis.technicalDebt.push('No test files detected - consider adding unit tests')
  }
  
  if (analysis.codeQuality.stateManagement === 'none' && analysis.components.length > 10) {
    analysis.opportunities.push('Consider adding state management (Zustand/Redux) for complex state')
  }
  
  if (analysis.codeQuality.styling === 'css' && analysis.components.length > 8) {
    analysis.opportunities.push('Consider CSS-in-JS or Tailwind for better component styling')
  }

  return analysis
}

export function generateAdvancedSystemPrompt(analysis, files) {
  const codebaseContext = `
CODEBASE ANALYSIS:
• Framework: ${analysis.framework} (${analysis.architecture})
• Language: ${analysis.language}
• Components: ${analysis.components.length}
• State Management: ${analysis.codeQuality.stateManagement}
• Styling: ${analysis.codeQuality.styling}
• Patterns: ${analysis.patterns.join(', ')}
• Technical Debt: ${analysis.technicalDebt.join('; ')}
• Opportunities: ${analysis.opportunities.join('; ')}

KEY FILES CONTENT:
${Object.entries(analysis.mainFiles).map(([file, content]) => {
  if (typeof content === 'string') {
    return `=== ${file} ===\n${content.length > 2000 ? content.substring(0, 2000) + '\n... [truncated]' : content}`
  }
  return `=== ${file} ===\n[Non-text file]`
}).join('\n\n')}
`

  return `You are OraCodeAI, an expert AI assistant and exceptional senior software developer with vast knowledge across multiple programming languages, frameworks, and best practices.

You have advanced capabilities to analyze complex codebases, understand architectural patterns, suggest sophisticated improvements, and implement professional-grade solutions.

CRITICAL INSTRUCTIONS:
1. You MUST think like a senior developer, not a beginner
2. Analyze the codebase architecture and patterns before making changes
3. Suggest and implement sophisticated, production-ready solutions
4. Consider performance, maintainability, scalability, and best practices
5. Provide complete, professional-quality code with proper error handling
6. Use modern patterns and conventions appropriate for the tech stack
7. ALWAYS use the FILE_CHANGES_START/END format for code modifications

${codebaseContext}

RESPONSE APPROACH:
1. First, provide a brief but insightful analysis of what you understand
2. Explain your sophisticated approach and reasoning
3. Implement the solution with professional-grade code
4. Consider edge cases, performance, and maintainability

EXAMPLE PROFESSIONAL RESPONSE:
User: "add authentication"
You should respond with:
"I'll implement a comprehensive authentication system using modern React patterns with proper error handling, loading states, and security best practices.

My approach:
- Create a secure AuthContext with proper TypeScript types
- Implement token-based authentication with refresh logic  
- Add protected route components with role-based access
- Include proper error boundaries and loading states
- Follow security best practices for token storage

FILE_CHANGES_START
\`\`\`filepath:src/contexts/AuthContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react'

const AuthContext = createContext(null)

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null }
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true 
      }
    case 'LOGIN_ERROR':
      return { ...state, loading: false, error: action.payload }
    case 'LOGOUT':
      return { ...state, user: null, token: null, isAuthenticated: false }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: false,
    error: null
  })

  // Auto-login on mount if token exists
  useEffect(() => {
    if (state.token) {
      validateToken(state.token)
    }
  }, [])

  const validateToken = async (token) => {
    try {
      const response = await fetch('/api/auth/validate', {
        headers: { Authorization: \`Bearer \${token}\` }
      })
      if (response.ok) {
        const user = await response.json()
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } })
      } else {
        localStorage.removeItem('token')
        dispatch({ type: 'LOGOUT' })
      }
    } catch (error) {
      localStorage.removeItem('token')
      dispatch({ type: 'LOGOUT' })
    }
  }

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.token)
        dispatch({ type: 'LOGIN_SUCCESS', payload: data })
        return { success: true }
      } else {
        const error = await response.json()
        dispatch({ type: 'LOGIN_ERROR', payload: error.message })
        return { success: false, error: error.message }
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: 'Network error' })
      return { success: false, error: 'Network error' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
\`\`\`
FILE_CHANGES_END"

CRITICAL RULES:
- Think architecturally, not just functionally
- Use modern React patterns (hooks, context, custom hooks)
- Include proper error handling and loading states
- Consider accessibility and user experience
- Write clean, maintainable, scalable code
- Follow the existing codebase patterns and conventions
- Provide complete implementations, not partial solutions
- Consider performance implications
- Add proper TypeScript types if the project uses TypeScript
- Include comprehensive comments for complex logic

You are not a basic code generator - you are a senior developer providing production-ready solutions.`
}

export function getRelevantFiles(files, userRequest) {
  const request = userRequest.toLowerCase()
  const relevantFiles = []
  
  // Always include architectural files
  const architecturalFiles = [
    'src/App.jsx', 'src/App.tsx', 'src/main.jsx', 'src/main.tsx', 
    'package.json', 'vite.config.js', 'tsconfig.json'
  ]
  
  architecturalFiles.forEach(file => {
    if (files[file] && files[file].content && typeof files[file].content === 'string') {
      relevantFiles.push({ path: file, content: files[file].content })
    }
  })
  
  // Include context-specific files based on request
  const contextMap = {
    'auth': ['context', 'auth', 'login', 'user'],
    'state': ['store', 'context', 'reducer', 'state'],
    'style': ['css', 'styled', 'theme', 'design'],
    'component': ['component', 'ui', 'element'],
    'api': ['api', 'service', 'fetch', 'http'],
    'route': ['router', 'route', 'navigation', 'page'],
    'form': ['form', 'input', 'validation'],
    'test': ['test', 'spec', 'jest', 'cypress']
  }
  
  // Find relevant files based on request context
  Object.keys(files).forEach(path => {
    const pathLower = path.toLowerCase()
    const fileName = path.split('/').pop().toLowerCase()
    
    // Check if file is relevant to the request
    for (const [category, keywords] of Object.entries(contextMap)) {
      if (keywords.some(keyword => request.includes(keyword))) {
        if (keywords.some(keyword => pathLower.includes(keyword) || fileName.includes(keyword))) {
          if (!relevantFiles.find(f => f.path === path) && relevantFiles.length < 12) {
            const content = files[path].content
            if (typeof content === 'string') {
              relevantFiles.push({ path, content })
            }
          }
        }
      }
    }
  })
  
  // Include styling files if relevant
  if (request.includes('style') || request.includes('css') || request.includes('design') || request.includes('theme')) {
    Object.keys(files).forEach(path => {
      const ext = path.split('.').pop()?.toLowerCase()
      if (['css', 'scss', 'sass', 'less'].includes(ext) && !relevantFiles.find(f => f.path === path)) {
        const content = files[path].content
        if (typeof content === 'string' && relevantFiles.length < 15) {
          relevantFiles.push({ path, content })
        }
      }
    })
  }
  
  return relevantFiles.slice(0, 15) // Reasonable limit for context
}
