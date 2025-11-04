const API_KEY = 'sk-958bd92ae81d48b286cc6121886385b5'
const BASE_URL = 'https://api.deepseek.com'
const MODEL = 'deepseek-chat'

export interface LlmMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LlmChoice {
  index: number
  message: LlmMessage
  finish_reason?: string
}

export interface LlmUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

export interface LlmResponse {
  id: string
  object?: string
  created: number
  model: string
  choices: LlmChoice[]
  usage?: LlmUsage
}

export async function postToLLM(messages: LlmMessage[]): Promise<LlmResponse> {
  const response = await fetch(BASE_URL + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: messages
    })
  })

  if (!response.ok) {
    throw new Error('Failed to fetch from LLM API')
  }

  const payload = (await response.json()) as LlmResponse
  return payload
}
