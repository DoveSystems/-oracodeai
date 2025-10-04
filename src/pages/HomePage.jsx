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
  CheckCircle
} from 'lucide-react'

const HomePage = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <Upload className="w-8 h-8" />,
      title: "Smart Project Upload",
      description: "Upload ZIP files or entire project folders with automatic file analysis and dependency detection"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Advanced Code Editor",
      description: "Monaco-powered editor with syntax highlighting, IntelliSense, and real-time collaboration"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Analysis",
      description: "Automatic codebase analysis with AI insights, suggestions, and intelligent code understanding"
    },
    {
      icon: <Play className="w-8 h-8" />,
      title: "Live Preview",
      description: "Real-time preview with automatic dependency installation, building, and hot reloading"
    },
    {
      icon: <Terminal className="w-8 h-8" />,
      title: "Integrated Terminal",
      description: "Built-in terminal for running commands, installing packages, and managing your development environment"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "One-Click Deploy",
      description: "Deploy to Netlify, Vercel, or GitHub Pages with a single click"
    }
  ]

  const steps = [
    {
      number: "01",
      title: "Upload Your Project",
      description: "Drag & drop your project files or ZIP archive. We'll automatically analyze your codebase structure and dependencies."
    },
    {
      number: "02", 
      title: "AI Analysis & Setup",
      description: "Our AI analyzes your entire codebase, understands your project structure, and prepares the development environment."
    },
    {
      number: "03",
      title: "Start Coding",
      description: "Edit your code with our advanced editor, get AI assistance, and see live previews of your changes instantly."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">CodeWonderAI</h1>
            </div>
            <button
              onClick={() => navigate('/upload')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold text-white mb-6">
              The Future of
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Code Development</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Upload your project, let AI analyze your codebase, and start coding with intelligent assistance. 
              Build, preview, and deploy your applications with unprecedented ease.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/upload')}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center space-x-2 text-lg"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Project</span>
              </button>
              <button
                onClick={() => navigate('/features')}
                className="px-8 py-4 border border-slate-600 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all duration-200 flex items-center justify-center space-x-2 text-lg"
              >
                <span>Learn More</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
            <p className="text-xl text-slate-300">Everything you need to develop, test, and deploy your applications</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700 hover:border-slate-600 transition-all duration-200">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 text-white">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-slate-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-slate-300">Get started in three simple steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">{step.number}</span>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">{step.title}</h3>
                <p className="text-slate-300 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Development?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of developers who are already using CodeWonderAI to build amazing applications
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center space-x-2 text-lg mx-auto"
          >
            <Upload className="w-5 h-5" />
            <span>Start Your Project</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold">CodeWonderAI</span>
            </div>
            <p className="text-slate-400">© 2024 CodeWonderAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
