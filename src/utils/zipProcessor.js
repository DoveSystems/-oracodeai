import JSZip from 'jszip'

export async function processZipFile(file) {
  try {
    const zip = new JSZip()
    const zipContent = await zip.loadAsync(file)
    
    const files = {}
    const promises = []

    // Extract all files
    zipContent.forEach((relativePath, zipEntry) => {
      if (!zipEntry.dir && !relativePath.startsWith('__MACOSX/')) {
        promises.push(
          zipEntry.async('text').then(content => {
            // Clean up the path - remove leading directory if all files are in one folder
            let cleanPath = relativePath
            
            // Check if all files are in a single root directory
            const pathParts = relativePath.split('/')
            if (pathParts.length > 1) {
              // Remove the first directory if it seems to be a container
              const rootDirs = Object.keys(zipContent.files)
                .filter(path => !zipContent.files[path].dir)
                .map(path => path.split('/')[0])
              
              const uniqueRootDirs = [...new Set(rootDirs)]
              if (uniqueRootDirs.length === 1 && pathParts[0] === uniqueRootDirs[0]) {
                cleanPath = pathParts.slice(1).join('/')
              }
            }
            
            if (cleanPath) {
              files[cleanPath] = {
                content,
                path: cleanPath
              }
            }
          }).catch(error => {
            console.warn(`Failed to read file ${relativePath}:`, error)
          })
        )
      }
    })

    await Promise.all(promises)

    // Determine project name
    const projectName = file.name.replace('.zip', '') || 'Untitled Project'

    console.log('Extracted files:', Object.keys(files))
    return { files, projectName }
  } catch (error) {
    console.error('ZIP processing error:', error)
    throw new Error(`Failed to process ZIP file: ${error.message}`)
  }
}
