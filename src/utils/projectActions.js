import JSZip from 'jszip'
import { useAppStore } from '../store/appStore'
import { getWebContainer } from './webcontainer.js'

export async function restartProject() {
  const { addLog, clearLogs, files, setStatus } = useAppStore.getState()
  
  clearLogs()
  addLog({ type: 'info', message: '🔄 Restarting project...' })
  setStatus('installing')
  
  try {
    // Re-trigger the preview process with existing files
    if (Object.keys(files).length > 0) {
      addLog({ type: 'info', message: '🚀 Re-initializing preview with existing files...' })
      
      // Import the preview function from previewUtils
      const { createLivePreview } = await import('./previewUtils')
      
      // Re-run the preview process
      await createLivePreview(files)
    } else {
      addLog({ type: 'warning', message: '⚠️ No files to restart. Please upload a project first.' })
    }
  } catch (error) {
    addLog({ type: 'error', message: `❌ Failed to restart: ${error.message}` })
    setStatus('error')
  }
}

export async function downloadProject() {
  const { files, workspace, addLog } = useAppStore.getState()
  
  try {
    addLog({ type: 'info', message: 'Preparing download...' })
    
    const zip = new JSZip()
    
    // Add all current files (including AI modifications)
    Object.entries(files).forEach(([path, file]) => {
      zip.file(path, file.content)
    })
    
    const blob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    })
    
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `${workspace.name}-updated.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    URL.revokeObjectURL(url)
    addLog({ type: 'success', message: `✅ Updated project downloaded as ${workspace.name}-updated.zip` })
    
  } catch (error) {
    addLog({ type: 'error', message: `Failed to download: ${error.message}` })
  }
}

export async function createBackup() {
  const { files, workspace, addLog } = useAppStore.getState()
  
  try {
    const zip = new JSZip()
    
    Object.entries(files).forEach(([path, file]) => {
      zip.file(path, file.content)
    })
    
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `${workspace.name}-backup-${new Date().toISOString().split('T')[0]}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    URL.revokeObjectURL(url)
    addLog({ type: 'success', message: 'Backup created successfully' })
    
  } catch (error) {
    addLog({ type: 'error', message: `Failed to create backup: ${error.message}` })
  }
}
