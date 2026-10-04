import { VOUCHER_PROMPT } from './prompt.js'

// Provider registry — each entry describes how to reach the LLM.
// Providers that speak the OpenAI chat-completions format share one adapter.
// Anthropic uses its own Messages API format.
//
// env var name for the API key is <PROVIDER>_API_KEY (e.g. OPENAI_API_KEY),
// unless overridden by apiKeyEnv below.

const PROVIDERS = {
  claude: {
    adapter: 'anthropic',
    model: 'claude-opus-5-5',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
  },
  openai: {
    adapter: 'openai_compat',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o',
    apiKeyEnv: 'OPENAI_API_KEY',
  },
  gemini: {
    adapter: 'openai_compat',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    model: 'gemini-2.0-flash',
    apiKeyEnv: 'GEMINI_API_KEY',
  },
  grok: {
    adapter: 'openai_compat',
    baseUrl: 'https://api.x.ai/v1',
    model: 'grok-2-vision-latest',
    apiKeyEnv: 'GROK_API_KEY',
  },
  // Meta Llama via Groq (fast inference)
  meta: {
    adapter: 'openai_compat',
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    apiKeyEnv: 'GROQ_API_KEY',
  },
  // Qwen via OpenRouter
  qwen: {
    adapter: 'openai_compat',
    baseUrl: 'https://openrouter.ai/api/v1',
    model: 'qwen/qwen2.5-vl-72b-instruct',
    apiKeyEnv: 'OPENROUTER_API_KEY',
  },
}

function parseJson(text) {
  const clean = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
  return JSON.parse(clean)
}

async function anthropicAdapter(config, apiKey, image, mediaType) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
          { type: 'text', text: VOUCHER_PROMPT },
        ],
      }],
    }),
  })
  if (!res.ok) throw new Error(`Anthropic error ${res.status}: ${await res.text()}`)
  const data = await res.json()
  const text = data.content?.find(b => b.type === 'text')?.text ?? ''
  return parseJson(text)
}

async function openaiCompatAdapter(config, apiKey, image, mediaType) {
  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mediaType};base64,${image}` } },
          { type: 'text', text: VOUCHER_PROMPT },
        ],
      }],
    }),
  })
  if (!res.ok) throw new Error(`${config.baseUrl} error ${res.status}: ${await res.text()}`)
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content ?? ''
  return parseJson(text)
}

export function getProviderName(env) {
  return (env.LLM_PROVIDER || 'claude').toLowerCase()
}

export function listProviders() {
  return Object.keys(PROVIDERS)
}

export async function scan(env, image, mediaType) {
  const name = getProviderName(env)
  const config = PROVIDERS[name]
  if (!config) {
    throw new Error(`Unknown provider "${name}". Available: ${Object.keys(PROVIDERS).join(', ')}`)
  }

  const apiKey = env[config.apiKeyEnv]
  if (!apiKey) {
    throw new Error(`Missing secret ${config.apiKeyEnv} for provider "${name}"`)
  }

  if (config.adapter === 'anthropic') {
    return anthropicAdapter(config, apiKey, image, mediaType)
  }
  return openaiCompatAdapter(config, apiKey, image, mediaType)
}
