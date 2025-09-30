// AI Provider configurations - users must provide their own API keys
export const AI_PROVIDERS = {
  openai: {
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4o-mini',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }),
    formatRequest: (messages, model) => ({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 4000,
    }),
  },
  anthropic: {
    name: 'Anthropic',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
    defaultModel: 'claude-3-5-sonnet-20241022',
    apiUrl: 'https://api.anthropic.com/v1/messages',
    headers: (apiKey) => ({
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    }),
    formatRequest: (messages, model) => ({
      model,
      messages: messages.filter(m => m.role !== 'system'),
      system: messages.find(m => m.role === 'system')?.content || '',
      max_tokens: 4000,
    }),
  },
  gemini: {
    name: 'Google Gemini',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash'],
    defaultModel: 'gemini-1.5-flash',
    apiUrl: (apiKey) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    formatRequest: (messages, model) => ({
      contents: messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
      systemInstruction: {
        parts: [{ text: messages.find(m => m.role === 'system')?.content || '' }],
      },
    }),
  },
}

export async function callAI(provider, messages, apiKey, model) {
  const config = AI_PROVIDERS[provider]
  if (!config) throw new Error(`Unknown provider: ${provider}`)

  // API key is now required for all providers
  if (!apiKey) {
    throw new Error(`API key required for ${config.name}. Please add your API key in settings.`)
  }

  const url = typeof config.apiUrl === 'function' 
    ? config.apiUrl(apiKey) 
    : config.apiUrl

  const response = await fetch(url, {
    method: 'POST',
    headers: config.headers(apiKey),
    body: JSON.stringify(config.formatRequest(messages, model || config.defaultModel)),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`${config.name} API error: ${error}`)
  }

  const data = await response.json()

  // Extract response based on provider
  switch (provider) {
    case 'openai':
      return data.choices[0]?.message?.content || 'No response'
    case 'anthropic':
      return data.content[0]?.text || 'No response'
    case 'gemini':
      return data.candidates[0]?.content?.parts[0]?.text || 'No response'
    default:
      throw new Error(`Unknown response format for ${provider}`)
  }
}
