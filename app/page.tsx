'use client'

import { FormEvent, useMemo, useState } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Command,
  Cpu,
  Database,
  Gauge,
  Layers3,
  Menu,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Router,
  Search,
  Settings2,
  Sparkles,
  Zap,
} from 'lucide-react'

type ActivityItem = {
  id: number
  task: string
  skill: string
  model: string
  provider: string
  tokens: string
  status: 'Local' | 'Free' | 'BYOK'
  time: string
}

const initialActivity: ActivityItem[] = [
  { id: 1, task: 'Translate product copy', skill: 'Translation', model: 'llama3.2:3b', provider: 'Ollama', tokens: '238', status: 'Local', time: '2m ago' },
  { id: 2, task: 'Summarize meeting notes', skill: 'Summarization', model: 'mistral:7b', provider: 'Ollama', tokens: '612', status: 'Local', time: '18m ago' },
  { id: 3, task: 'Fix auth middleware', skill: 'Coding', model: 'claude-3.5-sonnet', provider: 'Anthropic', tokens: '2,840', status: 'BYOK', time: '42m ago' },
  { id: 4, task: 'Write meta description', skill: 'SEO writing', model: 'qwen2.5:7b', provider: 'Ollama', tokens: '184', status: 'Local', time: '1h ago' },
]

const presets = ['Translate text', 'Summarize notes', 'Review code', 'Research a topic']
const navItems = [
  { label: 'Overview', icon: Gauge },
  { label: 'Routing', icon: Router },
  { label: 'Skills', icon: Layers3 },
  { label: 'Models', icon: BrainCircuit },
  { label: 'Usage', icon: Activity },
]

function MetricCard({ label, value, detail, icon: Icon, tone = 'lime', trend }: { label: string; value: string; detail: string; icon: typeof Gauge; tone?: 'lime' | 'blue' | 'violet' | 'slate'; trend?: string }) {
  return (
    <article className={`metric-card metric-${tone}`}>
      <div className="metric-top"><span>{label}</span><Icon size={17} aria-hidden="true" /></div>
      <div className="metric-value">{value}</div>
      <div className="metric-detail"><span>{detail}</span>{trend && <span className="trend"><ArrowUpRight size={13} />{trend}</span>}</div>
    </article>
  )
}

function ProviderCard({ name, description, model, status, enabled, onToggle, icon: Icon, tone }: { name: string; description: string; model: string; status: string; enabled: boolean; onToggle: () => void; icon: typeof Cpu; tone: string }) {
  return (
    <article className="provider-card">
      <div className="provider-heading">
        <div className={`provider-icon ${tone}`}><Icon size={18} /></div>
        <div><h3>{name}</h3><p>{description}</p></div>
        <button className={`toggle ${enabled ? 'is-on' : ''}`} onClick={onToggle} aria-label={`${enabled ? 'Disable' : 'Enable'} ${name}`} aria-pressed={enabled}><span /></button>
      </div>
      <div className="provider-bottom"><span className="model-pill"><span className={`status-dot ${enabled ? 'online' : ''}`} />{model}</span><span className="provider-status">{enabled ? status : 'Disabled'}</span></div>
    </article>
  )
}

export default function Page() {
  const [activeNav, setActiveNav] = useState('Overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [composer, setComposer] = useState('')
  const [isRouting, setIsRouting] = useState(false)
  const [range, setRange] = useState('Last 7 days')
  const [activity, setActivity] = useState(initialActivity)
  const [providers, setProviders] = useState({ Ollama: true, OpenRouter: true, 'BYOK APIs': true })

  const localPercent = useMemo(() => providers.Ollama ? '82%' : '0%', [providers.Ollama])

  async function submitTask(event: FormEvent) {
    event.preventDefault()
    if (!composer.trim() || isRouting) return
    const task = composer.trim()
    setIsRouting(true)
    try {
      const response = await fetch('/api/route-task', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'No provider is available')
      setActivity((current) => [{ id: Date.now(), task, skill: result.skill, model: result.model, provider: result.provider, tokens: result.tokens.toLocaleString(), status: result.route, time: 'just now' }, ...current].slice(0, 5))
      setComposer('')
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Routing failed. Check your provider settings.')
    } finally {
      setIsRouting(false)
    }
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'mobile-visible' : ''}`}>
        <div className="brand"><div className="brand-mark"><Network size={18} /></div><span>minroute</span><button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><PanelLeftClose size={18} /></button></div>
        <div className="workspace"><div className="workspace-avatar">A</div><div><strong>Acme workspace</strong><span>Personal plan</span></div><ChevronDown size={15} /></div>
        <nav aria-label="Main navigation"><p className="nav-label">Workspace</p>{navItems.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${activeNav === label ? 'active' : ''}`} onClick={() => { setActiveNav(label); setMobileOpen(false) }}><Icon size={17} /><span>{label}</span>{label === 'Usage' && <span className="nav-count">7d</span>}</button>)}</nav>
        <div className="sidebar-bottom"><div className="local-status"><span className="status-dot online" /><div><strong>Local-first routing</strong><span>Ollama is connected</span></div><Settings2 size={15} /></div><button className="nav-item"><CircleHelp size={17} /><span>Help center</span></button><a className="nav-item" href="/admin"><Settings2 size={17} /><span>Admin settings</span></a><div className="user-row"><div className="user-avatar">JD</div><div><strong>Jordan Davis</strong><span>jordan@example.com</span></div><ChevronDown size={15} /></div></div>
      </aside>
      {mobileOpen && <button className="sidebar-backdrop" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" />}
      <main className="main-content">
        <header className="topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={21} /></button><div className="breadcrumbs"><span>Workspace</span><span>/</span><strong>{activeNav}</strong></div><div className="top-actions"><button className="icon-button" aria-label="Search"><Search size={18} /></button><button className="command-button" aria-label="Open command menu"><Command size={15} /><span>⌘ K</span></button><button className="avatar-button" aria-label="Open profile menu">JD</button></div></header>
        <div className="page-wrap">
          <section className="page-heading"><div><div className="eyebrow"><span className="pulse-dot" />ROUTER ONLINE</div><h1>Good morning, Jordan.</h1><p>Here&apos;s how minroute is keeping your AI stack efficient.</p></div><div className="range-select"><select aria-label="Date range" value={range} onChange={(e) => setRange(e.target.value)}><option>Last 7 days</option><option>Last 30 days</option><option>Today</option></select><ChevronDown size={15} /></div></section>
          <section className="composer-card"><div className="composer-top"><div className="composer-icon"><Sparkles size={19} /></div><div><h2>Route a task</h2><p>Describe what you need. We&apos;ll choose the smallest capable model.</p></div><span className="shortcut-hint">⌘ ↵</span></div><form onSubmit={submitTask}><label htmlFor="task-input" className="sr-only">Describe your task</label><textarea id="task-input" value={composer} onChange={(e) => setComposer(e.target.value)} placeholder="Try: Translate this paragraph into Spanish..." rows={2} /><div className="composer-footer"><div className="preset-list">{presets.map((preset) => <button type="button" key={preset} onClick={() => setComposer(preset)}>{preset}</button>)}</div><button className="route-button" type="submit" disabled={!composer.trim() || isRouting}>{isRouting ? <><span className="spinner" />Routing</> : <><Zap size={16} />Route task</>}</button></div></form></section>
          <section className="metric-grid"><MetricCard label="Estimated savings" value="$18.42" detail="vs. using premium models" icon={ArrowDownRight} trend="24.6%" /><MetricCard label="Tokens optimized" value="184.2k" detail="of 226.8k total tokens" icon={Database} tone="blue" trend="12.8%" /><MetricCard label="Local routing" value={localPercent} detail="of tasks stayed on-device" icon={Cpu} tone="lime" trend="8.4%" /><MetricCard label="Avg. latency" value="1.24s" detail="across all routed tasks" icon={Clock3} tone="violet" trend="18.2%" /></section>
          <div className="content-grid"><section className="panel activity-panel"><div className="panel-heading"><div><h2>Recent routing activity</h2><p>Your latest tasks and model decisions.</p></div><button className="text-button">View all <ArrowUpRight size={14} /></button></div><div className="activity-list">{activity.map((item) => <div className="activity-row" key={item.id}><div className="activity-main"><div className={`activity-icon ${item.status.toLowerCase()}`}><Check size={15} /></div><div><strong>{item.task}</strong><span>{item.skill} <i /> {item.time}</span></div></div><div className="activity-model"><strong>{item.model}</strong><span>{item.provider}</span></div><div className="activity-tokens"><strong>{item.tokens}</strong><span>tokens</span></div><span className={`status-badge ${item.status.toLowerCase()}`}>{item.status}</span></div>)}</div></section>
            <section className="panel capability-panel"><div className="panel-heading"><div><h2>Model availability</h2><p>Fallback priority order.</p></div><button className="icon-button" aria-label="Model settings"><Settings2 size={16} /></button></div><div className="provider-list"><ProviderCard name="Ollama" description="Local models" model="llama3.2:3b" status="Connected" enabled={providers.Ollama} onToggle={() => setProviders((p) => ({ ...p, Ollama: !p.Ollama }))} icon={Cpu} tone="lime" /><ProviderCard name="OpenRouter" description="Free models" model="qwen-2.5-7b" status="Ready" enabled={providers.OpenRouter} onToggle={() => setProviders((p) => ({ ...p, OpenRouter: !p.OpenRouter }))} icon={Zap} tone="blue" /><ProviderCard name="BYOK APIs" description="Your API keys" model="3 providers" status="Fallback" enabled={providers['BYOK APIs']} onToggle={() => setProviders((p) => ({ ...p, 'BYOK APIs': !p['BYOK APIs'] }))} icon={Network} tone="violet" /></div><button className="add-provider"><Plus size={15} />Add provider</button></section></div>
          <section className="panel skills-panel"><div className="panel-heading"><div><h2>Active skills</h2><p>Skills are loaded only when a task needs them.</p></div><button className="text-button">Manage skills <ArrowUpRight size={14} /></button></div><div className="skills-grid"><div className="skill-item"><div className="skill-symbol">Aa</div><div><strong>Writing</strong><span>Low context · 4 models</span></div><span className="skill-live">Active</span></div><div className="skill-item"><div className="skill-symbol">&lt;/&gt;</div><div><strong>Coding</strong><span>High context · 6 models</span></div><span className="skill-live">Active</span></div><div className="skill-item"><div className="skill-symbol">文</div><div><strong>Translation</strong><span>Low context · 3 models</span></div><span className="skill-live">Active</span></div><div className="skill-item"><div className="skill-symbol">⌁</div><div><strong>Research</strong><span>High context · 5 models</span></div><span className="skill-live">Active</span></div></div></section>
        </div>
      </main>
    </div>
  )
}
