import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { routerSettings } from '@/lib/db/schema'

async function getUserId() { const session = await auth.api.getSession({ headers: await headers() }); if (!session?.user) return null; return session.user.id }
export async function GET() { const userId = await getUserId(); if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const rows = await db.select().from(routerSettings).where(eq(routerSettings.userId, userId)); return NextResponse.json(rows[0] ?? { userId, ollamaBaseUrl: 'http://127.0.0.1:11434', ollamaModel: 'llama3.2:3b', openRouterModel: 'openai/gpt-4o-mini', openAiModel: 'gpt-4o-mini', localFirst: true }) }
export async function PUT(request: Request) { const userId = await getUserId(); if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const body = await request.json(); const values = { userId, ollamaBaseUrl: String(body.ollamaBaseUrl ?? 'http://127.0.0.1:11434').slice(0, 200), ollamaModel: String(body.ollamaModel ?? 'llama3.2:3b').slice(0, 100), openRouterModel: String(body.openRouterModel ?? 'openai/gpt-4o-mini').slice(0, 100), openAiModel: String(body.openAiModel ?? 'gpt-4o-mini').slice(0, 100), localFirst: Boolean(body.localFirst), updatedAt: new Date() }; await db.insert(routerSettings).values(values).onConflictDoUpdate({ target: routerSettings.userId, set: values }); return NextResponse.json(values) }
