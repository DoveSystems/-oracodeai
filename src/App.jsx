import PreviewZip from './pages/PreviewZip.jsx';
import React from 'react'
import { useAppStore } from './store/appStore'
import UploadZone from './components/UploadZone'
import WorkspaceLayout from './components/WorkspaceLayout'

function App() {
  const { workspace } = useAppStore()

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {!workspace ? (
        <UploadZone />
      ) : (
        <WorkspaceLayout />
      )}
    </div>
  )
}

export default App
