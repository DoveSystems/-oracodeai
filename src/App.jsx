import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './store/appStore'
import HomePage from './pages/HomePage'
import ProjectUpload from './pages/ProjectUpload'
import Workspace from './pages/Workspace'
import Features from './pages/Features'
import Settings from './pages/Settings'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  const { files } = useAppStore()

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/features" element={<Features />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/upload" element={<ProjectUpload />} />
            <Route 
              path="/workspace" 
              element={
                files && Object.keys(files).length > 0 ? (
                  <Workspace />
                ) : (
                  <Navigate to="/upload" replace />
                )
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
