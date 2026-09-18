'use client'

import { FormEvent, useEffect, useState } from 'react'

const initial = { ollamaBaseUrl: 'http://127.0.0.1:11434', ollamaModel: 'llama3.2:3b', openRouterModel: 'openai/gpt-4o-mini', openAiModel: 'gpt-4o-mini', localFirst: true }
type Settings = typeof initial

export default function AdminPage() {
  const [settings, setSettings] = useState<Settings>(initial)
  const [status, setStatus] = useState('')
  const [testing, setTesting] = useState(false)
  const [health, setHealth] = useState<{ ollama: string; cloud: string } | null>(null)

  useEffect(() => {
    fetch('/api/settings').then(async (response) => {
      if (response.status === 401) throw new Error('Sign in to manage settings.')
      if (!response.ok) throw new Error('Could not load settings.')
      setSettings({ ...initial, ...(await response.json()) })
    }).catch((error) => setStatus(error instanceof Error ? error.message : 'Could not load settings.'))
  }, [])

  function update(key: keyof Settings, value: string | boolean) {
    setSettings((current) => ({ ...current, [key]: value }))
    setStatus('')
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    setStatus('Saving…')
    const response = await fetch('/api/settings', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(settings) })
    setStatus(response.ok ? 'Settings saved securely.' : 'Could not save settings. Sign in and try again.')
  }

  async function testProviders() {
    setTesting(true); setHealth(null); setStatus('Testing configured providers…')
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setHealth(data.providers)
      setStatus(response.ok ? 'Provider check complete.' : 'Provider check complete; review unavailable providers.')
    } catch { setStatus('Provider check failed.') } finally { setTesting(false) }
  }

  return <main className="settings-page">
    <div className="settings-header"><div><p className="eyebrow">ADMIN CONTROL PLANE</p><h1>Routing settings</h1><p>Configure the smallest capable path for every task on this host.</p></div><a className="text-button" href="/">Back to dashboard</a></div>
    <form className="settings-grid" onSubmit={save}>
      <section className="panel settings-section"><h2>Local provider</h2><p>Works with Ollama on Linux, macOS, Windows, and self-hosted servers.</p><label>Ollama base URL<input inputMode="url" value={settings.ollamaBaseUrl} onChange={(e) => update('ollamaBaseUrl', e.target.value)} /></label><label>Default local model<input value={settings.ollamaModel} onChange={(e) => update('ollamaModel', e.target.value)} /></label></section>
      <section className="panel settings-section"><h2>Cloud fallbacks</h2><p>API keys are server-side environment variables and are never sent to this browser.</p><label>OpenRouter model<input value={settings.openRouterModel} onChange={(e) => update('openRouterModel', e.target.value)} /></label><label>OpenAI-compatible model<input value={settings.openAiModel} onChange={(e) => update('openAiModel', e.target.value)} /></label></section>
      <section className="panel settings-section settings-actions"><label className="toggle-row"><span><strong>Local-first routing</strong><small>Prefer Ollama before cloud fallbacks.</small></span><input type="checkbox" checked={settings.localFirst} onChange={(e) => update('localFirst', e.target.checked)} /></label><div className="settings-buttons"><button className="route-button" type="submit">Save settings</button><button className="text-button" type="button" onClick={testProviders} disabled={testing}>{testing ? 'Testing…' : 'Test providers'}</button></div>{status && <span className="save-status" role="status">{status}</span>}{health && <div className="health-results" role="status"><span>Ollama: <strong>{health.ollama}</strong></span><span>Cloud fallback: <strong>{health.cloud}</strong></span></div>}</section>
    </form>
  </main>
}
