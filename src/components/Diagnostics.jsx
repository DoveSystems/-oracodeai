import React from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, ExternalLink, Copy, Check } from 'lucide-react'
import { getWebContainerDiagnostics } from '../utils/webcontainer.js'

const Diagnostics = () => {
  const [copied, setCopied] = React.useState(false)
  const diagnostics = getWebContainerDiagnostics()
  
  const checks = [
    {
      name: 'WebContainer Support',
      value: diagnostics.supported,
      description: 'Browser supports WebContainer API',
      critical: true
    },
    {
      name: 'SharedArrayBuffer',
      value: diagnostics.sharedArrayBuffer,
      description: 'Required for WebContainer threading',
      critical: true
    },
    {
      name: 'Cross-Origin Isolated',
      value: diagnostics.crossOriginIsolated,
      description: 'Proper security headers are set',
      critical: true
    },
    {
      name: 'Secure Context (HTTPS)',
      value: diagnostics.secureContext,
      description: 'Site is served over HTTPS',
      critical: true
    },
    {
      name: 'Top-level Browsing Context',
      value: diagnostics.topLevelBrowsingContext,
      description: 'Not embedded in iframe',
      critical: false
    },
    {
      name: 'Web Workers',
      value: diagnostics.workerSupport,
      description: 'Browser supports Web Workers',
      critical: false
    },
    {
      name: 'Service Workers',
      value: diagnostics.serviceWorkerSupport,
      description: 'Browser supports Service Workers',
      critical: false
    }
  ]

  const criticalFailures = checks.filter(check => check.critical && !check.value)
  const allCriticalPass = criticalFailures.length === 0

  const copyVercelConfig = () => {
    const config = `{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        },
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        }
      ]
    }
  ]
}`
    navigator.clipboard.writeText(config)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const potentialIsolationBreakers = [
    {
      condition: !diagnostics.crossOriginIsolated && window.location.hostname === 'localhost',
      message: 'Running on localhost - use 127.0.0.1 or proper domain'
    },
    {
      condition: !diagnostics.crossOriginIsolated && window.location.protocol !== 'https:',
      message: 'Not served over HTTPS - required for Cross-Origin Isolation'
    },
    {
      condition: !diagnostics.crossOriginIsolated,
      message: 'Missing Cross-Origin headers - check deployment configuration'
    },
    {
      condition: !diagnostics.topLevelBrowsingContext,
      message: 'Embedded in iframe - WebContainer may not work properly'
    }
  ].filter(item => item.condition)

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">WebContainer Diagnostics</h1>
        <p className="text-gray-600">
          Checking browser and deployment compatibility for live preview features
        </p>
      </div>

      {/* Overall Status */}
      <div className={`p-6 rounded-lg border-2 ${
        allCriticalPass 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center space-x-3">
          {allCriticalPass ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <XCircle className="w-8 h-8 text-red-600" />
          )}
          <div>
            <h2 className="text-xl font-semibold">
              {allCriticalPass ? '✅ Full WebContainer Support' : '❌ Basic Mode Only'}
            </h2>
            <p className="text-sm text-gray-600">
              {allCriticalPass 
                ? 'All critical requirements met - live preview available'
                : 'Some requirements not met - basic file viewing only'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Checks */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Detailed Compatibility Check</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {checks.map((check, index) => (
            <div key={index} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {check.value ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className={`w-5 h-5 ${check.critical ? 'text-red-500' : 'text-yellow-500'}`} />
                )}
                <div>
                  <div className="font-medium">{check.name}</div>
                  <div className="text-sm text-gray-500">{check.description}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {check.critical && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    Critical
                  </span>
                )}
                <span className={`text-sm font-medium ${
                  check.value ? 'text-green-600' : 'text-red-600'
                }`}>
                  {check.value ? 'Pass' : 'Fail'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vercel-Specific Fix */}
      {!allCriticalPass && window.location.hostname.includes('vercel.app') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                🔧 Vercel Deployment Fix
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                Your Vercel deployment is missing the required headers. Add this configuration:
              </p>
              
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-4 relative">
                <button
                  onClick={copyVercelConfig}
                  className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded"
                  title="Copy configuration"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <pre>{`{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        },
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        }
      ]
    }
  ]
}`}</pre>
              </div>
              
              <div className="space-y-2 text-sm text-blue-700">
                <p><strong>Steps to fix:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Create or update <code className="bg-blue-100 px-1 rounded">vercel.json</code> in your project root</li>
                  <li>Add the configuration above</li>
                  <li>Commit and push to trigger a new deployment</li>
                  <li>Wait for deployment to complete and test again</li>
                </ol>
              </div>
              
              <div className="mt-4 pt-4 border-t border-blue-200">
                <a
                  href="https://vercel.com/docs/projects/project-configuration#headers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline inline-flex items-center"
                >
                  Vercel Headers Documentation <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Netlify-Specific Fix */}
      {!allCriticalPass && window.location.hostname.includes('netlify.app') && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Info className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-teal-800 mb-3">
                🔧 Netlify Deployment Fix
              </h3>
              <p className="text-sm text-teal-700 mb-4">
                Your Netlify deployment is missing the required headers. Add this configuration:
              </p>
              
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-4">
                <pre>{`[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Embedder-Policy = "require-corp"
    Cross-Origin-Opener-Policy = "same-origin"`}</pre>
              </div>
              
              <div className="space-y-2 text-sm text-teal-700">
                <p><strong>Steps to fix:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Create or update <code className="bg-teal-100 px-1 rounded">netlify.toml</code> in your project root</li>
                  <li>Add the configuration above</li>
                  <li>Commit and push to trigger a new deployment</li>
                  <li>Wait for deployment to complete and test again</li>
                </ol>
              </div>
              
              <div className="mt-4 pt-4 border-t border-teal-200">
                <a
                  href="https://docs.netlify.com/routing/headers/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-teal-600 underline inline-flex items-center"
                >
                  Netlify Headers Documentation <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Potential Issues */}
      {potentialIsolationBreakers.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                Potential Issues
              </h3>
              <ul className="space-y-2">
                {potentialIsolationBreakers.map((issue, index) => (
                  <li key={index} className="text-sm text-yellow-700">
                    • {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* General Solutions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              {allCriticalPass ? 'Optimization Tips' : 'How to Enable Full Support'}
            </h3>
            
            {!allCriticalPass ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Platform Support:</h4>
                  <ul className="text-sm text-blue-700 space-y-1 ml-4">
                    <li>• ✅ <strong>Netlify:</strong> Supports custom headers via netlify.toml</li>
                    <li>• ✅ <strong>Vercel:</strong> Supports custom headers via vercel.json</li>
                    <li>• ❌ <strong>GitHub Pages:</strong> No custom header support</li>
                    <li>• ❌ <strong>Basic static hosts:</strong> Usually no header control</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Required Headers:</h4>
                  <div className="bg-blue-100 p-3 rounded text-sm font-mono text-blue-800">
                    Cross-Origin-Embedder-Policy: require-corp<br/>
                    Cross-Origin-Opener-Policy: same-origin
                  </div>
                </div>
              </div>
            ) : (
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• ✅ Your deployment is properly configured for WebContainer</li>
                <li>• ✅ Live preview and code execution are fully supported</li>
                <li>• ✅ All advanced features are available</li>
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Raw Diagnostics */}
      <details className="bg-gray-50 border border-gray-200 rounded-lg">
        <summary className="px-6 py-4 cursor-pointer font-medium">
          Raw Diagnostics Data
        </summary>
        <div className="px-6 pb-4">
          <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(diagnostics, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  )
}

export default Diagnostics
