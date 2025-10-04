import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Key, 
  Globe, 
  Database, 
  Save, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Settings as SettingsIcon,
  Bot,
  Cloud,
  Server
} from 'lucide-react'
import { useAppStore } from '../store/appStore'

const Settings = () => {
  const navigate = useNavigate()
  const { 
    apiKeys, 
    setApiKey, 
    selectedProvider, 
    setSelectedProvider,
    deploymentTokens,
    setDeploymentToken
  } = useAppStore()

  const [showKeys, setShowKeys] = useState({
    openai: false,
    anthropic: false,
    gemini: false,
    vercel: false,
    netlify: false,
    github: false
  })

  const [saveStatus, setSaveStatus] = useState(null)

  const toggleKeyVisibility = (key) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = () => {
    setSaveStatus('saving')
    setTimeout(() => {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(null), 2000)
    }, 1000)
  }

  const providers = [
    {
      id: 'openai',
      name: 'OpenAI',
      icon: Bot,
      description: 'GPT-4, GPT-3.5 Turbo models',
      placeholder: 'sk-...',
      color: 'text-green-400',
      bg: 'bg-green-500/20'
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      icon: Bot,
      description: 'Claude 3.5 Sonnet, Haiku models',
      placeholder: 'sk-ant-...',
      color: 'text-orange-400',
      bg: 'bg-orange-500/20'
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      icon: Bot,
      description: 'Gemini Pro models',
      placeholder: 'AI...',
      color: 'text-blue-400',
      bg: 'bg-blue-500/20'
    }
  ]

  const deploymentPlatforms = [
    {
      id: 'vercel',
      name: 'Vercel',
      icon: Cloud,
      description: 'Deploy to Vercel platform',
      placeholder: 'vercel_...',
      color: 'text-black',
      bg: 'bg-black/20'
    },
    {
      id: 'netlify',
      name: 'Netlify',
      icon: Globe,
      description: 'Deploy to Netlify platform',
      placeholder: 'netlify_...',
      color: 'text-green-400',
      bg: 'bg-green-500/20'
    },
    {
      id: 'github',
      name: 'GitHub Pages',
      icon: Server,
      description: 'Deploy to GitHub Pages',
      placeholder: 'ghp_...',
      color: 'text-gray-400',
      bg: 'bg-gray-500/20'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <SettingsIcon className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Settings</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* AI Providers Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <Key className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">AI Providers</h2>
          </div>
          
          <div className="grid gap-4">
            {providers.map((provider) => (
              <div key={provider.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${provider.bg} rounded-lg flex items-center justify-center`}>
                      <provider.icon className={`w-5 h-5 ${provider.color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{provider.name}</h3>
                      <p className="text-sm text-slate-400">{provider.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${apiKeys[provider.id] ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="text-sm text-slate-400">
                      {apiKeys[provider.id] ? 'Configured' : 'Not configured'}
                    </span>
                  </div>
                </div>
                
                <div className="relative">
                  <input
                    type={showKeys[provider.id] ? 'text' : 'password'}
                    value={apiKeys[provider.id] || ''}
                    onChange={(e) => setApiKey(provider.id, e.target.value)}
                    placeholder={provider.placeholder}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => toggleKeyVisibility(provider.id)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showKeys[provider.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deployment Platforms Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <Globe className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Deployment Platforms</h2>
          </div>
          
          <div className="grid gap-4">
            {deploymentPlatforms.map((platform) => (
              <div key={platform.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${platform.bg} rounded-lg flex items-center justify-center`}>
                      <platform.icon className={`w-5 h-5 ${platform.color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{platform.name}</h3>
                      <p className="text-sm text-slate-400">{platform.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${deploymentTokens[platform.id] ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="text-sm text-slate-400">
                      {deploymentTokens[platform.id] ? 'Configured' : 'Not configured'}
                    </span>
                  </div>
                </div>
                
                <div className="relative">
                  <input
                    type={showKeys[platform.id] ? 'text' : 'password'}
                    value={deploymentTokens[platform.id] || ''}
                    onChange={(e) => setDeploymentToken(platform.id, e.target.value)}
                    placeholder={platform.placeholder}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => toggleKeyVisibility(platform.id)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showKeys[platform.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>
              {saveStatus === 'saving' && 'Saving...'}
              {saveStatus === 'saved' && 'Saved!'}
              {!saveStatus && 'Save Settings'}
            </span>
            {saveStatus === 'saved' && <CheckCircle className="w-4 h-4" />}
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-200 mb-2">Security Notice</h3>
              <p className="text-sm text-blue-300 mb-3">
                Your API keys and tokens are stored locally in your browser and are never sent to our servers. 
                Make sure to keep your keys secure and never share them publicly.
              </p>
              <ul className="text-xs text-blue-300 space-y-1">
                <li>• API keys are encrypted and stored in browser localStorage</li>
                <li>• Keys are only used for direct communication with AI providers</li>
                <li>• You can clear all data by using the "Clear All Data" option</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
