import { create } from 'zustand'

export const useAppStore = create((set, get) => ({
  // Workspace state
  workspace: null,
  webcontainer: null,
  files: {},
  activeFile: null,
  
  // UI state
  logs: [],
  status: 'idle', // idle, uploading, installing, building, running, error, readonly
  previewUrl: null,
  showLogs: true,
  showAIChat: false,
  
  // AI state - removed usage tracking and default keys
  aiMessages: [],
  isAIProcessing: false,
  apiKeys: {
    openai: '',
    anthropic: '',
    gemini: '',
  },
  selectedProvider: 'openai',
  
  // Deployment state
  deploymentTokens: {
    vercel: '',
    netlify: '',
    github: ''
  },
  
  // Actions
  setWorkspace: (workspace) => set({ workspace }),
  setWebContainer: (webcontainer) => set({ webcontainer }),
  setFiles: (files) => set({ files }),
  setActiveFile: (file) => set({ activeFile: file }),
  setStatus: (status) => set({ status }),
  setPreviewUrl: (url) => set({ previewUrl: url }),
  setShowLogs: (show) => set({ showLogs: show }),
  setShowAIChat: (show) => set({ showAIChat: show }),
  
  addLog: (log) => set((state) => ({
    logs: [...state.logs, { ...log, timestamp: Date.now() }]
  })),
  
  clearLogs: () => set({ logs: [] }),
  
  updateFile: (path, content) => set((state) => ({
    files: {
      ...state.files,
      [path]: { 
        ...state.files[path], 
        content,
        lastModified: Date.now()
      }
    }
  })),
  
  // AI Actions
  addAIMessage: (message) => set((state) => ({
    aiMessages: [...state.aiMessages, { ...message, timestamp: Date.now() }]
  })),
  
  clearAIMessages: () => set({ aiMessages: [] }),
  
  setIsAIProcessing: (processing) => set({ isAIProcessing: processing }),
  
  setApiKey: (provider, key) => set((state) => ({
    apiKeys: { ...state.apiKeys, [provider]: key }
  })),
  
  setSelectedProvider: (provider) => set({ selectedProvider: provider }),
  
  // Deployment Actions
  setDeploymentToken: (platform, token) => set((state) => ({
    deploymentTokens: { ...state.deploymentTokens, [platform]: token }
  })),
  
  reset: () => set({
    workspace: null,
    webcontainer: null,
    files: {},
    activeFile: null,
    logs: [],
    status: 'idle',
    previewUrl: null,
    showAIChat: false,
    aiMessages: [],
    isAIProcessing: false,
  }),
}))
