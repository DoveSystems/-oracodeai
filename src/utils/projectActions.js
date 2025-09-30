import JSZip from 'jszip'
import { useAppStore } from '../store/appStore'
import { initializeWebContainer } from './webcontainer'

export async function restartProject() {
  const { addLog, clearLogs } = useAppStore.getState()
  
  clearLogs()
  addLog({ type: 'info', message: 'Restarting project...' })
  
  try {
    await initializeWebContainer()
  } catch (error) {
    addLog({ type: 'error', message: `Failed to restart: ${error.message}` })
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
