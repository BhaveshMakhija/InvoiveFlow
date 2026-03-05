import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SignInButton, SignUpButton, useUser } from '@clerk/clerk-react';
import { useTheme } from 'next-themes';
import { Zap, FileText, Brain, Shield, ArrowRight, Check, Sparkles, BarChart3, Globe, Sun, Moon } from 'lucide-react';

const FEATURES = [
    { icon: Brain, title: 'AI-Powered Generation', desc: 'Describe your invoice in plain English and let AI fill in all the details instantly.', color: '#3b82f6' },
    { icon: FileText, title: 'Professional Templates', desc: 'Beautiful invoice layouts with your logo, signature, and stamp — print-ready.', color: '#06b6d4' },
    { icon: BarChart3, title: 'Smart Dashboard', desc: 'Track paid, unpaid, and overdue invoices with real-time revenue analytics.', color: '#10b981' },
    { icon: Shield, title: 'Secure & Private', desc: 'Your data is encrypted and securely tied to your account via Clerk authentication.', color: '#f59e0b' },
    { icon: Globe, title: 'Multi-Currency', desc: 'Create invoices in INR, USD, EUR, and more — with automatic tax calculations.', color: '#ef4444' },
    { icon: Sparkles, title: 'Instant PDF Export', desc: 'Download or print professional invoices with a single click, anywhere, anytime.', color: '#8b5cf6' },
];

const STEPS = [
    { step: '01', title: 'Sign Up Free', desc: 'Create your account in seconds with email or Google.' },
    { step: '02', title: 'Set Up Your Business', desc: 'Add your company details, logo, signature and stamp.' },
    { step: '03', title: 'Create or AI-Generate', desc: 'Manually fill the form or let AI generate your invoice from a prompt.' },
    { step: '04', title: 'Send & Get Paid', desc: 'Download PDF, share it, and track payment status.' },
];

export default function LandingPage() {
    const { isSignedIn } = useUser();
    const { theme, setTheme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true) }, []);
    const currentTheme = mounted ? (theme === 'system' ? systemTheme : theme) : 'light';

    const toggleTheme = () => {
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', overflowX: 'hidden' }}>
            {/* Navbar */}
            <nav style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 48px', position: 'sticky', top: 0, zIndex: 50,
                background: 'rgba(var(--bg-primary-rgb), 0.8)', backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--border)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(59,130,246,0.4)'
                    }}>
                        <Zap size={18} color="white" />
                    </div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, background: 'linear-gradient(135deg, #3b82f6, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        InvoiceFlow
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', padding: 0 }}>
                        {currentTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    {isSignedIn ? (
                        <Link to="/dashboard" className="btn-primary">Go to Dashboard <ArrowRight size={16} /></Link>
                    ) : (
                        <>
                            <SignInButton mode="modal">
                                <button className="btn-secondary">Sign In</button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <button className="btn-primary">Get Started <ArrowRight size={16} /></button>
                            </SignUpButton>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero */}
            <section style={{ position: 'relative', padding: '120px 48px 80px', textAlign: 'center', overflow: 'hidden' }}>
                {/* Orbs */}
                <div className="orb" style={{ width: 500, height: 500, background: 'rgba(59,130,246,0.08)', top: -100, left: -150, animationDelay: '0s' }} />
                <div className="orb" style={{ width: 400, height: 400, background: 'rgba(6,182,212,0.06)', top: -50, right: -100, animationDelay: '4s' }} />
                <div className="orb" style={{ width: 300, height: 300, background: 'rgba(16,185,129,0.04)', bottom: 0, left: '40%', animationDelay: '8s' }} />

                <div style={{ position: 'relative', zIndex: 2, maxWidth: 800, margin: '0 auto' }}>
                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                        borderRadius: 999, padding: '6px 16px', marginBottom: 32
                    }}>
                        <div className="glow-dot" style={{ background: '#3b82f6', boxShadow: '0 0 8px #3b82f6' }} />
                        <span style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600 }}>
                            Powered by AI
                        </span>
                    </div>

                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 24, color: 'var(--text-primary)' }}>
                        Invoices that write{' '}
                        <span className="gradient-text">themselves</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 48, maxWidth: 600, margin: '0 auto 48px' }}>
                        Create professional invoices in seconds. Just describe what you need — InvoiceFlow's AI handles the rest. Send, track, and get paid faster.
                    </p>

                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {isSignedIn ? (
                            <Link to="/dashboard" className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: 14 }}>
                                Open Dashboard <ArrowRight size={18} />
                            </Link>
                        ) : (
                            <>
                                <SignUpButton mode="modal">
                                    <button className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: 14 }}>
                                        Start Free Today <ArrowRight size={18} />
                                    </button>
                                </SignUpButton>
                                <SignInButton mode="modal">
                                    <button className="btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: 14 }}>
                                        Sign In
                                    </button>
                                </SignInButton>
                            </>
                        )}
                    </div>

                    {/* Trust indicators */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginTop: 48, flexWrap: 'wrap' }}>
                        {['Free to start', 'No credit card', 'AI-powered', 'Print ready'].map(t => (
                            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <Check size={14} color="#10b981" />
                                {t}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Demo preview card */}
            <section style={{ padding: '0 48px 80px', display: 'flex', justifyContent: 'center' }}>
                <div style={{
                    maxWidth: 900, width: '100%',
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 24, overflow: 'hidden',
                    boxShadow: currentTheme === 'dark' ? '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.1)' : '0 40px 80px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)'
                }}>
                    {/* Fake browser bar */}
                    <div style={{ background: 'var(--bg-elevated)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)' }}>
                        {['#ef4444', '#f59e0b', '#10b981'].map(c => (
                            <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
                        ))}
                        <div style={{ flex: 1, background: 'rgba(128,128,128,0.1)', borderRadius: 8, padding: '4px 12px', fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 8 }}>
                            invoiceflow.app/create
                        </div>
                    </div>
                    {/* Mock invoice form inside */}
                    <div style={{ padding: 32 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 24 }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>✨ AI Prompt</div>
                                <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(6,182,212,0.06))', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, padding: 16, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    "Create invoice for web development services, 40 hours at $50/hr, for Acme Corp, 30 day payment terms, 10% tax"
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                    <div style={{ height: 36, flex: 1, background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.8rem', color: '#fff', fontWeight: 600 }}>
                                        <Sparkles size={14} /> Generate Invoice
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>⚡ Generated Result</div>
                                <div style={{ background: 'rgba(128,128,128,0.03)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                                    {[
                                        ['Invoice #', 'INV-202603-001'],
                                        ['Client', 'Acme Corp'],
                                        ['Service', 'Web Development (40hrs)'],
                                        ['Subtotal', '$2,000.00'],
                                        ['Tax (10%)', '$200.00'],
                                        ['Total', '$2,200.00'],
                                    ].map(([label, value]) => (
                                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                                            <span style={{ color: label === 'Total' ? '#10b981' : 'var(--text-primary)', fontWeight: label === 'Total' ? 700 : 400 }}>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section style={{ padding: '80px 48px' }}>
                <div style={{ textAlign: 'center', marginBottom: 64 }}>
                    <h2 className="section-title" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: 16 }}>
                        Everything you need to{' '}
                        <span className="gradient-text">invoice smarter</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 500, margin: '0 auto' }}>
                        Built for freelancers, agencies, and small businesses.
                    </p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
                    {FEATURES.map(({ icon: Icon, title, desc, color }) => (
                        <div key={title} className="glass glass-hover" style={{ padding: 28 }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 14, marginBottom: 20,
                                background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: `1px solid ${color}25`
                            }}>
                                <Icon size={22} color={color} />
                            </div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{title}</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section style={{ padding: '80px 48px', background: 'var(--bg-elevated)' }}>
                <div style={{ textAlign: 'center', marginBottom: 64 }}>
                    <h2 className="section-title" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: 16 }}>
                        Up and running in <span className="gradient-text">minutes</span>
                    </h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32, maxWidth: 900, margin: '0 auto' }}>
                    {STEPS.map(({ step, title, desc }, i) => (
                        <div key={step} style={{ textAlign: 'center' }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: '50%', margin: '0 auto 20px',
                                background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.1))',
                                border: '1px solid rgba(59,130,246,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.1rem', fontWeight: 800, color: '#3b82f6'
                            }}>
                                {step}
                            </div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{title}</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: '80px 48px', textAlign: 'center' }}>
                <div style={{
                    maxWidth: 600, margin: '0 auto',
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(6,182,212,0.05))',
                    border: '1px solid rgba(59,130,246,0.2)', borderRadius: 28, padding: '60px 40px'
                }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 16, color: 'var(--text-primary)' }}>
                        Ready to get paid <span className="gradient-text">faster?</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 36, lineHeight: 1.6 }}>
                        Join thousands of professionals creating stunning invoices in seconds.
                    </p>
                    {isSignedIn ? (
                        <Link to="/dashboard" className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem', borderRadius: 14 }}>
                            Open Dashboard <ArrowRight size={18} />
                        </Link>
                    ) : (
                        <SignUpButton mode="modal">
                            <button className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem', borderRadius: 14 }}>
                                Start for Free <ArrowRight size={18} />
                            </button>
                        </SignUpButton>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '32px 48px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Zap size={16} color="#3b82f6" />
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>InvoiceFlow © 2026</span>
                </div>
            </footer>
        </div>
    );
}
