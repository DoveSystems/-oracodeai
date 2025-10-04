import { WebContainer } from '@webcontainer/api'

// Global WebContainer instance - only one can exist
let webcontainerInstance = null

export async function getWebContainer() {
  if (webcontainerInstance) {
    console.log('Using existing WebContainer instance')
    return webcontainerInstance
  }

  // Check if WebContainer is supported first
  if (!isWebContainerSupported()) {
    console.warn('WebContainer not supported in this environment')
    return null
  }

  try {
    console.log('Booting WebContainer...')
    webcontainerInstance = await WebContainer.boot()
    console.log('WebContainer booted successfully')
    
    return webcontainerInstance
  } catch (error) {
    console.error('Failed to boot WebContainer:', error)
    // Check if it's the "single instance" error
    if (error.message && error.message.includes('Only a single WebContainer instance')) {
      console.warn('WebContainer instance already exists elsewhere, trying to reuse...')
      // Try to get the existing instance by checking if WebContainer is already booted
      try {
        // This is a workaround - we'll handle this gracefully
        return null
      } catch (retryError) {
        console.error('Could not reuse existing WebContainer:', retryError)
        return null
      }
    }
    return null
  }
}

export function clearWebContainer() {
  if (webcontainerInstance) {
    console.log('Clearing WebContainer instance')
    webcontainerInstance = null
  }
}

export function isWebContainerSupported() {
  // Check all required conditions for WebContainer
  const diagnostics = getWebContainerDiagnostics()
  
  const isSupported = (
    diagnostics.supported &&
    diagnostics.sharedArrayBuffer &&
    diagnostics.crossOriginIsolated &&
    diagnostics.secureContext &&
    diagnostics.topLevelBrowsingContext
  )
  
  console.log('WebContainer diagnostics:', diagnostics)
  console.log('WebContainer supported:', isSupported)
  
  return isSupported
}

export function getWebContainerDiagnostics() {
  return {
    supported: WebContainer.supported,
    sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
    crossOriginIsolated: crossOriginIsolated,
    secureContext: isSecureContext,
    topLevelBrowsingContext: window === window.top,
    workerSupport: typeof Worker !== 'undefined',
    serviceWorkerSupport: 'serviceWorker' in navigator,
  }
}

export async function initializeWebContainer() {
  try {
    const webcontainer = await getWebContainer()
    if (webcontainer) {
      console.log('WebContainer initialized successfully')
      return webcontainer
    } else {
      console.warn('WebContainer initialization failed - not supported in this environment')
      return null
    }
  } catch (error) {
    console.error('Failed to initialize WebContainer:', error)
    return null
  }
}
