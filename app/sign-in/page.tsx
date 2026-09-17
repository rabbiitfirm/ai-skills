import Link from 'next/link'
import { AuthForm } from '@/components/auth-form'

export default function SignInPage() { return <main className="auth-page"><section className="auth-card"><div className="brand"><div className="brand-mark">↗</div><span>minroute</span></div><h1>Welcome back</h1><p>Sign in to manage your routing workspace.</p><AuthForm mode="sign-in" /><p className="auth-switch">New to minroute? <Link href="/sign-up">Create an account</Link></p></section></main> }
