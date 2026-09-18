import Link from 'next/link'
import { AuthForm } from '@/components/auth-form'

export default function SignUpPage() { return <main className="auth-page"><section className="auth-card"><div className="brand"><div className="brand-mark">↗</div><span>minroute</span></div><h1>Create your workspace</h1><p>Start routing tasks locally and efficiently.</p><AuthForm mode="sign-up" /><p className="auth-switch">Already have an account? <Link href="/sign-in">Sign in</Link></p></section></main> }
