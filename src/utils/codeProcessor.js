import { useAppStore } from '../store/appStore'

export function parseAIResponse(response) {
  const changes = []
  
  console.log('=== PARSING AI RESPONSE ===')
  console.log('Response length:', response.length)
  console.log('First 500 chars:', response.substring(0, 500))
  
  // Look for FILE_CHANGES_START and FILE_CHANGES_END markers
  const startMarker = 'FILE_CHANGES_START'
  const endMarker = 'FILE_CHANGES_END'
  
  const startIndex = response.indexOf(startMarker)
  const endIndex = response.indexOf(endMarker)
  
  console.log('Markers found:', { startIndex, endIndex })
  
  if (startIndex !== -1 && endIndex !== -1) {
    const changesSection = response.substring(startIndex + startMarker.length, endIndex)
    console.log('Changes section length:', changesSection.length)
    console.log('Changes section preview:', changesSection.substring(0, 300))
    
    const codeBlockRegex = /```filepath:([^\n]+)\n([\s\S]*?)```/g
    let match

    while ((match = codeBlockRegex.exec(changesSection)) !== null) {
      const filePath = match[1].trim()
      const content = match[2].trim()
      
      console.log('Found file change:', filePath, 'Content length:', content.length)
      
      changes.push({
        path: filePath,
        content: content,
        action: useAppStore.getState().files[filePath] ? 'update' : 'create'
      })
    }
  } else {
    console.log('No FILE_CHANGES markers found, trying alternative parsing...')
    
    // More aggressive fallback parsing
    const patterns = [
      /```(?:filepath:)?([^\n]*\.[a-zA-Z]+)\n([\s\S]*?)```/g,
      /```([^\n]*\.[a-zA-Z]+)\n([\s\S]*?)```/g,
      /```\n([^\n]*\.[a-zA-Z]+)\n([\s\S]*?)```/g
    ]
    
    for (const pattern of patterns) {
      let match
      while ((match = pattern.exec(response)) !== null) {
        const filePath = match[1].trim()
        const content = match[2].trim()
        
        // Skip if it's not a valid file path
        if (!filePath.includes('.') || filePath.includes(' ') || filePath.length > 100) continue
        
        console.log('Fallback found file change:', filePath, 'Content length:', content.length)
        
        changes.push({
          path: filePath,
          content: content,
          action: useAppStore.getState().files[filePath] ? 'update' : 'create'
        })
      }
      
      if (changes.length > 0) break // Stop at first successful pattern
    }
  }

  // Extract explanation (everything before FILE_CHANGES_START or the whole response if no changes)
  const explanation = startIndex !== -1 
    ? response.substring(0, startIndex).trim()
    : response.trim()

  console.log('=== PARSING RESULT ===')
  console.log('Changes found:', changes.length)
  console.log('Changes:', changes.map(c => ({ path: c.path, contentLength: c.content.length })))
  console.log('Has changes:', changes.length > 0)
  console.log('Needs permission:', response.includes('Should I proceed') || response.includes('Shall I') || response.includes('Would you like me to'))

  return {
    explanation,
    changes,
    hasChanges: changes.length > 0,
    needsPermission: response.includes('Should I proceed') || response.includes('Shall I') || response.includes('Would you like me to')
  }
}

export async function applyCodeChangesRealTime(changes, onProgress) {
  const { updateFile, webcontainer, addLog, setActiveFile } = useAppStore.getState()
  
  console.log('=== APPLYING CHANGES ===')
  console.log('Changes to apply:', changes)
  
  try {
    let processedFiles = 0
    
    for (const change of changes) {
      const isNewFile = !useAppStore.getState().files[change.path]
      
      console.log(`Processing file ${processedFiles + 1}/${changes.length}: ${change.path}`)
      console.log('Content preview:', change.content.substring(0, 200) + '...')
      
      // Update progress
      onProgress?.({
        current: processedFiles + 1,
        total: changes.length,
        currentFile: change.path,
        action: isNewFile ? 'Creating' : 'Updating'
      })
      
      // Add a small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Update in store (this triggers real-time UI updates)
      updateFile(change.path, change.content)
      console.log(`✅ Updated ${change.path} in store`)
      
      // Set as active file to show in editor
      setActiveFile(change.path)
      
      // Update in webcontainer if available
      if (webcontainer) {
        try {
          // Ensure directory exists
          const pathParts = change.path.split('/')
          if (pathParts.length > 1) {
            const dirPath = pathParts.slice(0, -1).join('/')
            await webcontainer.fs.mkdir(dirPath, { recursive: true })
          }
          
          await webcontainer.fs.writeFile(change.path, change.content)
          console.log(`✅ Updated ${change.path} in webcontainer`)
          
          if (isNewFile) {
            addLog({ type: 'success', message: `✅ Created ${change.path}` })
          } else {
            addLog({ type: 'success', message: `✅ Updated ${change.path}` })
          }
        } catch (error) {
          console.error(`❌ Failed to write ${change.path} to webcontainer:`, error)
          addLog({ type: 'warning', message: `⚠️ Failed to write ${change.path} to webcontainer: ${error.message}` })
        }
      }
      
      processedFiles++
    }
    
    // Final progress update
    onProgress?.({
      current: changes.length,
      total: changes.length,
      currentFile: 'Complete',
      action: 'Finished'
    })
    
    addLog({ 
      type: 'success', 
      message: `🎉 All changes applied successfully! Modified ${changes.length} file(s)` 
    })
    
    return true
  } catch (error) {
    console.error('❌ Failed to apply changes:', error)
    addLog({ type: 'error', message: `❌ Failed to apply changes: ${error.message}` })
    return false
  }
}

export function createChangesSummary(changes) {
  if (changes.length === 0) return 'No changes to apply'
  
  const summary = changes.map(change => {
    const action = useAppStore.getState().files[change.path] ? '📝 Update' : '📄 Create'
    return `${action}: ${change.path}`
  }).join('\n')
  
  return `Proposed changes:\n${summary}`
}

export async function streamApplyChanges(changes, addMessage) {
  const { addLog } = useAppStore.getState()
  
  console.log('=== STREAMING CHANGES ===')
  console.log('Changes to stream:', changes)
  
  // Add initial progress message
  const progressMessageId = Date.now()
  addMessage({
    role: 'assistant',
    content: `🔄 Applying ${changes.length} changes to your code...`,
    isProgress: true,
    progressId: progressMessageId,
    timestamp: Date.now()
  })
  
  const updateProgress = (progress) => {
    const percentage = Math.round((progress.current / progress.total) * 100)
    const progressBar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5))
    
    addMessage({
      role: 'assistant',
      content: `🔄 ${progress.action} ${progress.currentFile}...\n\n[${progressBar}] ${percentage}%\n\nProgress: ${progress.current}/${progress.total} files`,
      isProgress: true,
      progressId: progressMessageId,
      timestamp: Date.now()
    }, true) // Replace previous progress message
  }
  
  try {
    const success = await applyCodeChangesRealTime(changes, updateProgress)
    
    if (success) {
      // Replace progress with success message
      addMessage({
        role: 'assistant',
        content: `✅ Code changes applied successfully!\n\n🎯 Modified files:\n${changes.map(c => `• ${c.path}`).join('\n')}\n\n🚀 Your app has been updated! Check the editor and preview.`,
        isSuccess: true,
        timestamp: Date.now()
      }, true) // Replace progress message
    }
    
    return success
  } catch (error) {
    console.error('❌ Stream apply changes error:', error)
    // Replace progress with error message
    addMessage({
      role: 'assistant',
      content: `❌ Failed to apply changes: ${error.message}`,
      isError: true,
      timestamp: Date.now()
    }, true) // Replace progress message
    
    return false
  }
}
