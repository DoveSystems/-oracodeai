import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Code, 
  Zap, 
  Brain, 
  Play, 
  Upload, 
  FileText, 
  Terminal, 
  Globe,
  Sparkles,
  ArrowRight,
  CheckCircle,
  ArrowLeft,
  Shield,
  Layers,
  GitBranch,
  Monitor,
  Smartphone,
  Wifi,
  Database,
  Settings
} from 'lucide-react'

const Features = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <Upload className="w-12 h-12 text-blue-400" />,
      title: "Smart Project Upload",
      description: "Upload ZIP files or entire project folders with automatic file analysis and dependency detection",
      details: [
        "Drag & drop file upload",
        "ZIP file extraction",
        "Automatic dependency detection",
        "File structure analysis",
        "Project type recognition"
      ]
    },
    {
      icon: <Code className="w-12 h-12 text-green-400" />,
      title: "Advanced Code Editor",
      description: "Monaco-powered editor with syntax highlighting, IntelliSense, and real-time collaboration",
      details: [
        "Monaco Editor integration",
        "Syntax highlighting for 50+ languages",
        "IntelliSense autocomplete",
        "Multi-cursor editing",
        "Code folding and minimap"
      ]
    },
    {
      icon: <Brain className="w-12 h-12 text-purple-400" />,
      title: "AI-Powered Analysis",
      description: "Automatic codebase analysis with AI insights, suggestions, and intelligent code understanding",
      details: [
        "Codebase analysis",
        "AI code suggestions",
        "Bug detection and fixes",
        "Code optimization",
        "Documentation generation"
      ]
    },
    {
      icon: <Play className="w-12 h-12 text-orange-400" />,
      title: "Live Preview",
      description: "Real-time preview with automatic dependency installation, building, and hot reloading",
      details: [
        "WebContainer integration",
        "Automatic dependency installation",
        "Hot module reloading",
        "Localhost fallback",
        "Real-time updates"
      ]
    },
    {
      icon: <Terminal className="w-12 h-12 text-cyan-400" />,
      title: "Integrated Terminal",
      description: "Built-in terminal for running commands, installing packages, and managing your development environment",
      details: [
        "Full terminal emulation",
        "Command history",
        "Multiple sessions",
        "Package management",
        "Environment variables"
      ]
    },
    {
      icon: <Globe className="w-12 h-12 text-pink-400" />,
      title: "One-Click Deploy",
      description: "Deploy to Netlify, Vercel, or GitHub Pages with a single click",
      details: [
        "Netlify integration",
        "Vercel deployment",
        "GitHub Pages support",
        "Custom domains",
        "Environment configuration"
      ]
    }
  ]

  const technicalSpecs = [
    {
      icon: <Monitor className="w-8 h-8 text-blue-400" />,
      title: "Cross-Platform",
      description: "Works on Windows, macOS, and Linux"
    },
    {
      icon: <Smartphone className="w-8 h-8 text-green-400" />,
      title: "Responsive Design",
      description: "Optimized for desktop and mobile devices"
    },
    {
      icon: <Wifi className="w-8 h-8 text-purple-400" />,
      title: "Real-time Sync",
      description: "Live collaboration and instant updates"
    },
    {
      icon: <Database className="w-8 h-8 text-orange-400" />,
      title: "Cloud Storage",
      description: "Secure cloud storage for your projects"
    },
    {
      icon: <Shield className="w-8 h-8 text-red-400" />,
      title: "Secure",
      description: "End-to-end encryption and secure connections"
    },
    {
      icon: <Settings className="w-8 h-8 text-cyan-400" />,
      title: "Customizable",
      description: "Fully customizable interface and settings"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </button>
              <div className="h-6 w-px bg-slate-600"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold">Features</h1>
              </div>
            </div>
            <button
              onClick={() => navigate('/upload')}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Powerful Features for Modern Development</h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Everything you need to build, test, and deploy your applications in one place
          </p>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 hover:border-slate-600 transition-all">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-400 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, i) => (
                      <li key={i} className="flex items-center space-x-2 text-sm text-slate-300">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Technical Specifications */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-12">Technical Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technicalSpecs.map((spec, index) => (
              <div key={index} className="bg-slate-800/30 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all">
                <div className="flex items-center space-x-3 mb-3">
                  {spec.icon}
                  <h4 className="text-lg font-semibold">{spec.title}</h4>
                </div>
                <p className="text-slate-400">{spec.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-12 border border-slate-700">
          <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-xl text-slate-400 mb-8">
            Upload your project and experience the power of AI-assisted development
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/upload')}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all flex items-center justify-center space-x-2"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Project</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-all flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Features
