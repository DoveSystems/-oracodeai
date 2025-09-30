import { WebContainer } from '@webcontainer/api'

let webcontainerInstance = null

export async function getWebContainer() {
  if (webcontainerInstance) {
    return webcontainerInstance
  }

  try {
    console.log('Booting WebContainer...')
    webcontainerInstance = await WebContainer.boot()
    console.log('WebContainer booted successfully')
    
    return webcontainerInstance
  } catch (error) {
    console.error('Failed to boot WebContainer:', error)
    // In development, try to continue without WebContainer
    if (import.meta.env.DEV) {
      console.warn('WebContainer failed to boot, but continuing in development mode')
      return null
    }
    return null
  }
}

export function isWebContainerSupported() {
  // Always return true for development - we'll handle errors gracefully
  if (import.meta.env.DEV) {
    return true
  }
  
  return (
    WebContainer.supported &&
    typeof SharedArrayBuffer !== 'undefined' &&
    crossOriginIsolated &&
    isSecureContext
  )
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
