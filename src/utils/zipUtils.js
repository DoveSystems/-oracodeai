import JSZip from 'jszip'

export const createZipFromFiles = (files) => {
  try {
    const zip = new JSZip()
    
    // Add all files to the ZIP
    Object.keys(files).forEach(filename => {
      const file = files[filename]
      zip.file(filename, file.content)
    })
    
    // Generate the ZIP file
    zip.generateAsync({ type: 'blob' }).then((content) => {
      // Create download link
      const url = URL.createObjectURL(content)
      const link = document.createElement('a')
      link.href = url
      link.download = 'project.zip'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    })
    
    return true
  } catch (error) {
    console.error('Error creating ZIP:', error)
    return false
  }
}

export const extractZipToFiles = async (zipFile) => {
  try {
    const zip = new JSZip()
    const zipContent = await zip.loadAsync(zipFile)
    const files = {}
    
    // Extract all files
    for (const [filename, file] of Object.entries(zipContent.files)) {
      if (!file.dir) {
        const content = await file.async('text')
        files[filename] = { content, path: filename }
      }
    }
    
    return files
  } catch (error) {
    console.error('Error extracting ZIP:', error)
    return null
  }
}
