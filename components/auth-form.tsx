'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setBusy(true)
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email') ?? ''), password = String(data.get('password') ?? ''), name = String(data.get('name') ?? '')
    const result = mode === 'sign-up' ? await authClient.signUp.email({ email, password, name }) : await authClient.signIn.email({ email, password })
    setBusy(false)
    if (result.error) { setError('We could not complete that request. Check your details and try again.'); return }
    router.push('/'); router.refresh()
  }
  return <form className="auth-form" onSubmit={submit}>{mode === 'sign-up' && <label>Name<input name="name" required autoComplete="name" /></label>}<label>Email<input name="email" type="email" required autoComplete="email" /></label><label>Password<input name="password" type="password" minLength={8} required autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="route-button auth-submit" disabled={busy}>{busy ? 'Working…' : mode === 'sign-up' ? 'Create account' : 'Sign in'}</button></form>
}
