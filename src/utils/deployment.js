/**
 * Advanced deployment helpers for Netlify & Vercel using their APIs.
 * NOTE: API keys are stored locally and never sent to our servers.
 */

export function saveDeploymentSettings(settings) {
  localStorage.setItem('oracodeai_deploy_settings', JSON.stringify(settings || {}))
}

export function loadDeploymentSettings() {
  try {
    return JSON.parse(localStorage.getItem('oracodeai_deploy_settings') || '{}')
  } catch {
    return {}
  }
}

// Netlify API deployment
export async function deployToNetlify(apiKey, siteId, files) {
  if (!apiKey) throw new Error('Netlify API key is required')
  if (!siteId) throw new Error('Netlify site ID is required')
  
  try {
    // Create a ZIP file of the project
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    
    Object.entries(files).forEach(([path, file]) => {
      zip.file(path, file.content)
    })
    
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    
    // Upload to Netlify
    const formData = new FormData()
    formData.append('file', zipBlob, 'project.zip')
    
    const response = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Netlify deployment failed: ${error}`)
    }
    
    const result = await response.json()
    return {
      success: true,
      url: result.url,
      deployId: result.id,
      message: 'Successfully deployed to Netlify!'
    }
  } catch (error) {
    throw new Error(`Netlify deployment error: ${error.message}`)
  }
}

// Vercel API deployment
export async function deployToVercel(apiToken, projectName, files) {
  if (!apiToken) throw new Error('Vercel API token is required')
  if (!projectName) throw new Error('Project name is required')
  
  try {
    // Create a ZIP file of the project
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    
    Object.entries(files).forEach(([path, file]) => {
      zip.file(path, file.content)
    })
    
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    
    // Upload to Vercel
    const formData = new FormData()
    formData.append('file', zipBlob, 'project.zip')
    
    const response = await fetch(`https://api.vercel.com/v13/deployments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
      body: formData
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Vercel deployment failed: ${error}`)
    }
    
    const result = await response.json()
    return {
      success: true,
      url: result.url,
      deployId: result.id,
      message: 'Successfully deployed to Vercel!'
    }
  } catch (error) {
    throw new Error(`Vercel deployment error: ${error.message}`)
  }
}

// GitHub Pages deployment
export async function deployToGitHub(accessToken, repoName, files) {
  if (!accessToken) throw new Error('GitHub access token is required')
  if (!repoName) throw new Error('Repository name is required (format: owner/repo)')
  
  try {
    // Create a ZIP file of the project
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    
    Object.entries(files).forEach(([path, file]) => {
      zip.file(path, file.content)
    })
    
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    
    // Upload to GitHub
    const response = await fetch(`https://api.github.com/repos/${repoName}/actions/workflows/pages.yml/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        ref: 'main'
      })
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`GitHub deployment failed: ${error}`)
    }
    
    return {
      success: true,
      url: `https://${repoName.split('/')[0]}.github.io/${repoName.split('/')[1]}`,
      message: 'Successfully triggered GitHub Pages deployment!'
    }
  } catch (error) {
    throw new Error(`GitHub deployment error: ${error.message}`)
  }
}

// Validate API keys
export async function validateNetlifyKey(apiKey) {
  try {
    const response = await fetch('https://api.netlify.com/api/v1/user', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    })
    return response.ok
  } catch {
    return false
  }
}

export async function validateVercelToken(token) {
  try {
    const response = await fetch('https://api.vercel.com/v2/user', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.ok
  } catch {
    return false
  }
}

export async function validateGitHubToken(token) {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    return response.ok
  } catch {
    return false
  }
}
