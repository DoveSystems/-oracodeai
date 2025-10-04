import { getWebContainer } from './webcontainer'

export const createLivePreview = async (files) => {
  try {
    const webcontainerInstance = await getWebContainer()
    
    if (!webcontainerInstance) {
      throw new Error('WebContainer not available - please check your browser settings')
    }

    // Convert files to WebContainer format
    const fileTree = {}
    for (const [path, content] of Object.entries(files)) {
      const parts = path.split('/')
      let current = fileTree

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        const isLast = i === parts.length - 1

        if (isLast) {
          current[part] = { file: { contents: content } }
        } else {
          if (!current[part]) {
            current[part] = { directory: {} }
          }
          current = current[part].directory
        }
      }
    }

    await webcontainerInstance.mount(fileTree)
    
    // Find package.json and install dependencies
    const packageJson = files['package.json']
    if (packageJson) {
      const installProcess = await webcontainerInstance.spawn('npm', ['install'])
      await installProcess.exit
    }

    // Start the dev server
    const devServerProcess = await webcontainerInstance.spawn('npm', ['run', 'dev'])
    
    // Wait for the server to start
    webcontainerInstance.on('server-ready', (port, url) => {
      console.log('Server ready on port', port, 'at', url)
    })

    return { url: 'http://localhost:3000', type: 'webcontainer' }
  } catch (error) {
    console.error('Preview creation error:', error)
    throw error
  }
}
