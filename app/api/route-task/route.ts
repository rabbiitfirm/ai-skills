import { NextResponse } from 'next/server'
import { z } from 'zod'

const requestSchema = z.object({
  task: z.string().trim().min(1).max(20000),
  preferredProvider: z.enum(['auto', 'ollama', 'openrouter', 'openai']).default('auto'),
})

type ProviderResult = { text: string; model: string; provider: string; tokens: number; latencyMs: number }

function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4))
}

async function callOpenAICompatible(baseUrl: string, apiKey: string | undefined, model: string, task: string, provider: string): Promise<ProviderResult> {
  const started = Date.now()
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}) },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: task }], temperature: 0.2 }),
    signal: AbortSignal.timeout(45000),
  })
  if (!response.ok) throw new Error(`${provider} returned ${response.status}`)
  const data = await response.json()
  const text = data.choices?.[0]?.message?.content
  if (typeof text !== 'string' || !text) throw new Error(`${provider} returned no text`)
  return { text, model, provider, tokens: data.usage?.total_tokens ?? estimateTokens(task + text), latencyMs: Date.now() - started }
}

export async function POST(request: Request) {
  try {
    const parsed = requestSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Enter a task between 1 and 20,000 characters.' }, { status: 400 })
    const { task, preferredProvider } = parsed.data
    const complex = /architect|security|analy[sz]|debug|code review|research|migration/i.test(task)
    const attempts = preferredProvider === 'ollama'
      ? [['ollama', process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434', undefined, process.env.OLLAMA_MODEL ?? (complex ? 'qwen2.5-coder:7b' : 'llama3.2:3b')]]
      : preferredProvider === 'openai'
        ? [['openai', 'https://api.openai.com', process.env.OPENAI_API_KEY, process.env.OPENAI_MODEL ?? 'gpt-4o-mini']]
        : preferredProvider === 'openrouter'
          ? [['openrouter', 'https://openrouter.ai/api', process.env.OPENROUTER_API_KEY, process.env.OPENROUTER_MODEL ?? 'openai/gpt-4o-mini']]
          : [
              ['ollama', process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434', undefined, process.env.OLLAMA_MODEL ?? (complex ? 'qwen2.5-coder:7b' : 'llama3.2:3b')],
              ['openrouter', 'https://openrouter.ai/api', process.env.OPENROUTER_API_KEY, process.env.OPENROUTER_MODEL ?? 'openai/gpt-4o-mini'],
              ['openai', 'https://api.openai.com', process.env.OPENAI_API_KEY, process.env.OPENAI_MODEL ?? 'gpt-4o-mini'],
            ]

    const errors: string[] = []
    for (const [provider, baseUrl, key, model] of attempts as string[][]) {
      if (provider !== 'ollama' && !key) continue
      try {
        const result = await callOpenAICompatible(baseUrl, key, model, task, provider)
        return NextResponse.json({ ...result, skill: complex ? 'Software analysis' : 'General task', route: provider === 'ollama' ? 'Local' : 'BYOK', optimizedTokens: Math.ceil(result.tokens * 0.82) })
      } catch (error) {
        errors.push(`${provider}: ${error instanceof Error ? error.message : 'unavailable'}`)
      }
    }
    return NextResponse.json({ error: 'No configured model provider is reachable.', details: errors, setup: 'Connect Ollama on this host or add an OpenRouter/OpenAI API key in your deployment environment.' }, { status: 503 })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
