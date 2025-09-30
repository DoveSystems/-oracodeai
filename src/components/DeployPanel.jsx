import React, { useEffect, useState } from 'react'
import { triggerNetlifyBuild, triggerVercelBuild, saveDeploymentSettings, loadDeploymentSettings } from '../utils/deployment'
import { Rocket, CheckCircle, XCircle, ExternalLink, Globe } from 'lucide-react'

export default function DeployPanel({ onClose }) {
  const [netlifyHook, setNetlifyHook] = useState('')
  const [vercelHook, setVercelHook] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const s = loadDeploymentSettings()
    setNetlifyHook(s.netlifyHook || '')
    setVercelHook(s.vercelHook || '')
  }, [])

  const save = () => {
    saveDeploymentSettings({ netlifyHook, vercelHook })
    setMessage('Saved locally.')
    setTimeout(() => setMessage(''), 1500)
  }

  const doNetlify = async () => {
    try {
      setMessage('Triggering Netlify build...')
      await triggerNetlifyBuild(netlifyHook)
      setMessage('✅ Netlify build triggered. Check your Netlify deploys dashboard.')
    } catch (e) {
      setMessage('❌ ' + (e?.message || 'Failed to trigger Netlify build'))
    }
  }

  const doVercel = async () => {
    try {
      setMessage('Triggering Vercel build...')
      await triggerVercelBuild(vercelHook)
      setMessage('✅ Vercel build triggered. Check your Vercel deployments.')
    } catch (e) {
      setMessage('❌ ' + (e?.message || 'Failed to trigger Vercel build'))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-gray-900 border border-gray-700 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-indigo-300" />
            <div className="font-semibold">One‑Click Deploy</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="p-4 space-y-4">
          <div className="text-sm text-gray-300">
            Paste your **Build Hook URL** from Netlify or Vercel. These are secret URLs—only store them locally on a trusted device.
          </div>

          <div>
            <label className="text-xs text-gray-400">Netlify Build Hook URL</label>
            <input value={netlifyHook} onChange={e=>setNetlifyHook(e.target.value)} placeholder="https://api.netlify.com/build_hooks/..." className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm" />
            <div className="text-xs text-gray-500 mt-1">
              Get one via <a className="text-indigo-300 hover:text-indigo-200" href="https://app.netlify.com/sites" target="_blank" rel="noreferrer">Netlify Site Settings <ExternalLink className="inline w-3 h-3" /></a> → Build & deploy → Build hooks.
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={doNetlify} className="px-3 py-2 bg-green-700 hover:bg-green-600 rounded text-sm">Trigger Netlify Build</button>
            </div>
          </div>

          <div className="h-px bg-gray-800" />

          <div>
            <label className="text-xs text-gray-400">Vercel Build Hook URL</label>
            <input value={vercelHook} onChange={e=>setVercelHook(e.target.value)} placeholder="https://api.vercel.com/v1/integrations/deploy/..." className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm" />
            <div className="text-xs text-gray-500 mt-1">
              Create one via <a className="text-indigo-300 hover:text-indigo-200" href="https://vercel.com/dashboard" target="_blank" rel="noreferrer">Vercel Project Settings <ExternalLink className="inline w-3 h-3" /></a> → Deploy Hooks.
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={doVercel} className="px-3 py-2 bg-green-700 hover:bg-green-600 rounded text-sm">Trigger Vercel Build</button>
            </div>
          </div>

          {message && <div className="text-sm mt-2">{message}</div>}

          <div className="text-xs text-gray-400 mt-2">
            Tip: combine with the **Diagnostics** panel to ensure isolation headers are working before triggering production builds.
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 flex items-center justify-between">
          <div className="text-xs text-gray-400">Build hooks are stored in your browser’s localStorage only.</div>
          <button onClick={save} className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">Save</button>
        </div>
      </div>
    </div>
  )
}
