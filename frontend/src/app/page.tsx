'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Wallet, Plus, TrendingUp, FileText, BookOpen, ExternalLink, RefreshCw,
  Sparkles, ArrowRight, Menu, X, Globe, DollarSign, User, CheckCircle2,
  AlertCircle, Lock, Search, Newspaper, Coins, Zap,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
type Tab = 'home' | 'register' | 'dashboard' | 'read';

const NAV = [
  { id: 'home' as Tab, label: 'Home', icon: Sparkles },
  { id: 'register' as Tab, label: 'Register', icon: FileText },
  { id: 'dashboard' as Tab, label: 'Dashboard', icon: TrendingUp },
  { id: 'read' as Tab, label: 'Read', icon: BookOpen },
];

export default function Page() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({ connector: injected() });
  const { disconnect } = useDisconnect();
  const [tab, setTab] = useState<Tab>('home');
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const h = (e: CustomEvent) => { setTab(e.detail as Tab); setMobileOpen(false); };
    window.addEventListener('nav', h as EventListener);
    return () => window.removeEventListener('nav', h as EventListener);
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gold-400/20 bg-white/90 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                G
              </div>
              <span className="font-bold text-[#171717] text-base tracking-tight">Griot</span>
              <Badge variant="gold" className="hidden sm:inline-flex text-[10px] px-2.5 py-0.5">Arc Testnet</Badge>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {NAV.map(n => (
                <button key={n.id} onClick={() => setTab(n.id)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    tab === n.id
                      ? 'bg-gradient-to-r from-gold-500 to-gold-400 text-white shadow-sm'
                      : 'text-gold-600/60 hover:text-gold-500 hover:bg-gold-50'
                  }`}>
                  <n.icon className="w-3.5 h-3.5" /> {n.label}
                </button>
              ))}
              <div className="ml-4 pl-4 border-l border-gold-400/20 flex items-center gap-2">
                {!mounted ? (
                  <div className="w-24 h-7 rounded-lg bg-gold-50 animate-pulse" />
                ) : isConnected ? (
                  <>
                    <span className="text-xs text-gold-600 font-mono">{address?.slice(0,6)}...{address?.slice(-4)}</span>
                    <Button variant="ghost" size="sm" onClick={() => disconnect()}>Exit</Button>
                  </>
                ) : (
                  <Button size="sm" onClick={() => connect()} className="gap-1.5">
                    <Wallet className="w-3.5 h-3.5" /> Connect Wallet
                  </Button>
                )}
              </div>
            </nav>

            <div className="md:hidden flex items-center gap-2">
              {!mounted ? (
                <div className="w-16 h-6 rounded bg-gold-50 animate-pulse" />
              ) : isConnected ? (
                <span className="text-xs text-gold-600 font-mono">{address?.slice(0,4)}..</span>
              ) : (
                <Button size="sm" onClick={() => connect()} className="text-xs px-3 py-1 gap-1">
                  <Wallet className="w-3 h-3" /> Connect
                </Button>
              )}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gold-600/60 hover:text-gold-500">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {mobileOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden">
                <div className="pb-4 space-y-1">
                  {NAV.map(n => (
                    <button key={n.id} onClick={() => { setTab(n.id); setMobileOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                        tab === n.id ? 'bg-gradient-to-r from-gold-500/10 to-gold-400/10 text-gold-500' : 'text-gold-600/60'
                      }`}>
                      <n.icon className="w-4 h-4" /> {n.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Pages */}
      <main>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            {tab === 'home' && <Home isConnected={isConnected} onConnect={() => connect()} mounted={mounted} />}
            {tab === 'register' && <Register />}
            {tab === 'dashboard' && <Dashboard />}
            {tab === 'read' && <Read />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ============================== HOME ============================== */
function Home({ isConnected, onConnect, mounted }: { isConnected: boolean; onConnect: () => void; mounted: boolean }) {
  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* Hero */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-20 overflow-hidden">
        {/* Decorative bg */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-br from-gold-400/5 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-tl from-gold-500/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 bg-gradient-to-r from-gold-500/10 to-gold-400/10 border border-gold-400/20 text-gold-500 shadow-sm">
              <Zap className="w-3.5 h-3.5" /> AI Content Monetization on Arc Testnet
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-[#171717] leading-[1.05] tracking-tight">
              Earn USDC when
              <br />
              <span className="bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 bg-clip-text text-transparent">
                AI cites your work
              </span>
            </h1>
            <p className="mt-6 text-lg text-gold-600/60 max-w-xl mx-auto leading-relaxed">
              Register your articles once. Get paid in USDC automatically when AI agents 
              reference your content on Arc Testnet.
            </p>
            <motion.div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              {!mounted ? (
                <div className="w-60 h-12 rounded-xl bg-gold-50 animate-pulse" />
              ) : isConnected ? (
                <>
                  <Button onClick={() => window.dispatchEvent(new CustomEvent('nav', { detail: 'register' }))} size="lg" className="gap-2 shadow-lg shadow-gold-500/20">
                    <Plus className="w-5 h-5" /> Register Article
                  </Button>
                  <Button variant="outline" onClick={() => window.dispatchEvent(new CustomEvent('nav', { detail: 'dashboard' }))} size="lg" className="gap-2">
                    <TrendingUp className="w-5 h-5" /> Dashboard
                  </Button>
                </>
              ) : (
                <Button size="lg" onClick={onConnect} className="gap-2 shadow-lg shadow-gold-500/20 px-8">
                  <Wallet className="w-5 h-5" /> Connect Wallet to Start
                </Button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <motion.section className="pb-16" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-3 divide-x divide-gold-400/20 rounded-2xl border border-gold-400/20 bg-white shadow-sm overflow-hidden">
            {[
              { icon: Newspaper, v: '0', l: 'Articles Registered' },
              { icon: BookOpen, v: '0', l: 'AI Citations' },
              { icon: Coins, v: '0 USDC', l: 'Paid to Creators' },
            ].map((s, i) => (
              <div key={i} className="py-7 text-center">
                <s.icon className="w-4 h-4 mx-auto text-gold-500/40 mb-2" />
                <div className="text-2xl font-bold bg-gradient-to-r from-gold-500 to-gold-400 bg-clip-text text-transparent">{s.v}</div>
                <div className="text-xs text-gold-600/50 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How it works */}
      <section className="pb-24">
        <motion.div className="text-center mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="text-2xl font-bold text-[#171717]">How it works</h2>
          <p className="text-sm text-gold-600/50 mt-1">Three simple steps to start earning</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {[
            { step: '01', icon: '📝', title: 'Register Content', desc: 'Submit your article URL, set a price in USDC, and choose citation tracking or paywall mode.' },
            { step: '02', icon: '🤖', title: 'AI Cites You', desc: 'When AI agents reference your work, they automatically pay via the x402 HTTP protocol.' },
            { step: '03', icon: '💰', title: 'Earn USDC', desc: 'Payments settle directly to your wallet through Circle programmable wallets.' },
          ].map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i + 0.2 }}>
              <Card className="h-full group cursor-default hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="text-[10px] font-mono text-gold-500/40 mb-2">{c.step}</div>
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">{c.icon}</div>
                  <CardTitle>{c.title}</CardTitle>
                  <CardDescription>{c.desc}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ============================== REGISTER ============================== */
function Register() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({ connector: injected() });
  const [url, setUrl] = useState('');
  const [price, setPrice] = useState('');
  const [mode, setMode] = useState<'citation' | 'paywall'>('citation');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<any>(null);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    setLoading(true); setErr(''); setDone(null);
    try {
      const r = await fetch(`${API}/api/registry/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, canonical_url: url, price, wallet: address, mode, username: username || undefined }),
      });
      const d = await r.json();
      if (r.ok) { setDone(d); setUrl(''); setPrice(''); }
      else setErr(d.error || 'Failed');
    } catch (err: any) { setErr(err.message); }
    setLoading(false);
  };

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <Card className="max-w-sm mx-auto">
          <CardHeader>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-500/10 to-gold-400/10 flex items-center justify-center mx-auto mb-3 border border-gold-400/20">
              <FileText className="w-6 h-6 text-gold-500" />
            </div>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>Connect to register articles on Arc Testnet</CardDescription>
          </CardHeader>
          <CardContent><Button onClick={() => connect()} className="w-full gap-2"><Wallet className="w-4 h-4" /> Connect Wallet</Button></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="max-w-lg mx-auto">
        <motion.div className="mb-10" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-4 bg-gradient-to-r from-gold-500/10 to-gold-400/10 border border-gold-400/20 text-gold-500">
            <Plus className="w-3 h-3" /> New Registration
          </div>
          <h2 className="text-2xl font-bold text-[#171717]">Register Article</h2>
          <p className="text-sm text-gold-600/60 mt-1">Submit your content for AI attribution on Arc Testnet</p>
        </motion.div>

        <motion.form onSubmit={submit} className="space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div>
            <label className="block text-xs font-medium text-gold-600/70 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Article URL
            </label>
            <Input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/article" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gold-600/70 mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Price (USDC)
            </label>
            <div className="relative max-w-[180px]">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold-600/40 text-sm">$</span>
              <Input type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.50" className="pl-8" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gold-600/70 mb-2">Access Mode</label>
            <div className="grid grid-cols-2 gap-3">
              {(['citation', 'paywall'] as const).map(m => (
                <button key={m} type="button" onClick={() => setMode(m)}
                  className={`p-4 rounded-xl text-left text-sm transition-all ${
                    mode === m
                      ? 'bg-gradient-to-r from-gold-500/10 to-gold-400/10 border-2 border-gold-500/30 text-[#171717] shadow-sm'
                      : 'border border-gold-400/20 text-gold-600/60 hover:border-gold-500/30 bg-white'
                  }`}>
                  <div className="font-medium text-base mb-1">{m === 'citation' ? '📖 Citation' : '🔒 Paywall'}</div>
                  <div className="text-xs text-gold-600/50">{m === 'citation' ? 'Free to read, track AI citations' : 'Require payment to unlock content'}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gold-600/70 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Username <span className="font-normal text-gold-600/40">(optional)</span>
            </label>
            <Input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="mycreatorname" className="max-w-[200px]" />
          </div>
          {err && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" /> {err}
            </div>
          )}
          <Button type="submit" disabled={loading || !price} className="w-full h-12 gap-2 text-base">
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {loading ? 'Registering...' : 'Register Article'}
          </Button>
        </motion.form>

        {done && (
          <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="mt-8">
            <Card className="border-gold-500/30 bg-gradient-to-r from-gold-50 to-white">
              <CardHeader>
                <div className="flex items-center gap-2 text-sm font-semibold text-gold-500">
                  <CheckCircle2 className="w-5 h-5" /> Article Registered
                </div>
                <CardDescription>ID: {done.id} · ${price} USDC · {mode} mode</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ============================== DASHBOARD ============================== */
function Dashboard() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({ connector: injected() });
  const { data: balance } = useBalance({ address });
  const [articles, setArticles] = useState<any[] | null>(null);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!address || loaded) return;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`${API}/api/registry/by-wallet/${address}`);
        if (r.ok) { const d = await r.json(); setArticles(d.articles || []); setEarnings(d.total_earnings || 0); }
      } catch { /* no creator yet */ }
      setLoading(false); setLoaded(true);
    })();
  }, [address, loaded]);

  if (!isConnected) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <Card className="max-w-sm mx-auto">
          <CardHeader>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-500/10 to-gold-400/10 flex items-center justify-center mx-auto mb-3 border border-gold-400/20">
              <TrendingUp className="w-6 h-6 text-gold-500" />
            </div>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>Connect your wallet to see your stats</CardDescription>
          </CardHeader>
          <CardContent><Button onClick={() => connect()} className="w-full gap-2"><Wallet className="w-4 h-4" /> Connect Wallet</Button></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
                    <Wallet className="w-3 h-3" /> Connected Wallet
                  </CardDescription>
                  <CardTitle className="font-mono text-sm mt-1">{address?.slice(0,8)}...{address?.slice(-6)}</CardTitle>
                </div>
                <Badge variant="gold" className="text-[10px]">Arc Testnet</Badge>
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
                <DollarSign className="w-3 h-3" /> Balance
              </CardDescription>
              <CardTitle className="text-xl">{balance ? Number(balance.formatted).toFixed(4) : '0'} <span className="text-sm font-normal text-gold-600/40">ETH</span></CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
                <TrendingUp className="w-3 h-3" /> Earnings
              </CardDescription>
              <CardTitle className="text-xl bg-gradient-to-r from-gold-500 to-gold-400 bg-clip-text text-transparent">{earnings} <span className="text-sm font-normal text-gold-600/40">USDC</span></CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Articles */}
        <Card>
          <div className="px-6 py-4 border-b border-gold-400/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-gold-500" />
              <span className="text-sm font-semibold text-[#171717]">Articles</span>
              {loading && <RefreshCw className="w-3 h-3 animate-spin text-gold-600/40" />}
            </div>
            {articles && <button onClick={() => { setLoaded(false); setArticles(null); }} className="text-xs text-gold-600/50 hover:text-gold-500 transition-colors flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Refresh</button>}
          </div>
          <CardContent className="pt-4">
            {!loaded ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-gold-50 animate-pulse" />)}</div>
            ) : articles && articles.length > 0 ? (
              <div className="space-y-2">
                {articles.map((a: any, i: number) => (
                  <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="group flex items-center justify-between p-4 rounded-xl border border-gold-400/10 hover:border-gold-400/30 hover:bg-gold-50/50 transition-all">
                    <div className="min-w-0 flex-1">
                      <a href={a.canonical_url || a.original_url} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-[#171717] hover:text-gold-500 transition-colors truncate block font-medium">
                        {a.canonical_url || a.original_url}
                      </a>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs font-semibold text-gold-500">${a.price} USDC</span>
                        <Badge variant={a.mode === 'paywall' ? 'warning' : 'default'} className="text-[10px] px-2 py-0">{a.mode}</Badge>
                        {a.created_at && <span className="text-[10px] text-gold-600/40">{new Date(a.created_at).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <a href={`/?read=${a.id}`}
                      className="text-xs text-gold-600/40 hover:text-gold-500 transition-colors ml-4 opacity-0 group-hover:opacity-100 shrink-0 font-medium flex items-center gap-1">
                      View <ArrowRight className="w-3 h-3" />
                    </a>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-500/10 to-gold-400/10 flex items-center justify-center mx-auto mb-4 border border-gold-400/20">
                  <Newspaper className="w-6 h-6 text-gold-500/60" />
                </div>
                <p className="text-sm text-gold-600/50 mb-5">No articles registered yet</p>
                <Button onClick={() => window.dispatchEvent(new CustomEvent('nav', { detail: 'register' }))} className="gap-2">
                  <Plus className="w-4 h-4" /> Register Your First Article
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/* ============================== READ ============================== */
function Read() {
  const [slug, setSlug] = useState('');
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get('read');
    if (s) { setSlug(s); fetchArticle(s); }
  }, []);

  const fetchArticle = async (id: string) => {
    setLoading(true); setErr(''); setArticle(null);
    try {
      const r = await fetch(`${API}/api/read/${encodeURIComponent(id)}`);
      const d = await r.json();
      if (r.status === 402 && d.x402) setArticle({ x402: d.x402 });
      else if (r.ok) setArticle(d);
      else setErr(d.error || 'Not found');
    } catch (err: any) { setErr(err.message); }
    setLoading(false);
  };

  const lookup = () => { if (!slug) return; window.history.pushState({}, '', `/?read=${encodeURIComponent(slug)}`); fetchArticle(slug); };

  const pay = async () => {
    if (!article?.x402) return;
    const p = article.x402.payment;
    try {
      const r = await fetch(`${API}/api/pay`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: slug, amount: p.amount, wallet: p.wallet }) });
      const d = await r.json();
      if (d.success && d.tx_hash) fetchArticle(slug); else setErr('Payment failed');
    } catch (err: any) { setErr(err.message); }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold text-[#171717] mb-1">Read Article</h2>
          <p className="text-sm text-gold-600/60 mb-8">Enter an article ID or slug to view content</p>

          <div className="flex gap-2 mb-8">
            <Input type="text" value={slug} onChange={e => setSlug(e.target.value)} placeholder="Article ID" className="flex-1" />
            <Button onClick={lookup} disabled={!slug || loading} className="gap-2">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? '...' : 'Read'}
            </Button>
          </div>

          {err && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" /> {err}
            </div>
          )}

          {article?.x402 && (
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
              <Card className="border-amber-200 bg-amber-50/30">
                <CardHeader>
                  <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold">
                    <Lock className="w-4 h-4" /> Payment Required
                  </div>
                  <CardDescription className="mt-1">
                    Unlock this article for <strong className="text-[#171717]">{article.x402.payment.amount} USDC</strong>.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-xs text-gold-600/50 space-y-0.5 font-mono bg-white/50 rounded-lg p-3 border border-amber-200/50">
                    <p>Recipient: {article.x402.payment.wallet}</p>
                    <p>Network: {article.x402.payment.chain}</p>
                  </div>
                  <Button onClick={pay} className="w-full gap-2 text-base h-12">
                    <Lock className="w-4 h-4" /> Pay {article.x402.payment.amount} USDC
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {article && !article.x402 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h3 className="text-xl font-bold text-[#171717]">{article.title || 'Untitled'}</h3>
              {article.payment && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <CheckCircle2 className="w-4 h-4" /> Payment verified — {article.payment.amount} USDC
                </div>
              )}
              <div className="text-gold-600/80 leading-relaxed whitespace-pre-wrap text-sm">
                {article.content || 'No content available.'}
              </div>
              {article.canonical_url && (
                <a href={article.canonical_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-gold-500 hover:text-gold-600 hover:underline font-medium">
                  <ExternalLink className="w-4 h-4" /> View Source
                </a>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
