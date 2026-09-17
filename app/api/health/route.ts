import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ollamaUrl = (process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434').replace(/\/$/, '')
  let ollama = 'unavailable'
  try {
    const response = await fetch(`${ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(4000), cache: 'no-store' })
    ollama = response.ok ? 'connected' : `HTTP ${response.status}`
  } catch { ollama = 'unavailable' }

  const cloud = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY ? 'configured' : 'not configured'
  return NextResponse.json({ status: 'ok', providers: { ollama, cloud }, timestamp: new Date().toISOString() })
}
