const API_KEY = "sk-958bd92ae81d48b286cc6121886385b5";
const BASE_URL = "https://api.deepseek.com";
const MODEL = 'deepseek-chat';

export async function postToLLM(messages: any[]) {
  const response = await fetch(BASE_URL + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: messages,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch from LLM API');
  }

  return response.json();
} 