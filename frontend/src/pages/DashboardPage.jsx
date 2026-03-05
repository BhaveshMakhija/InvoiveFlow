import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { invoiceApi } from '../lib/api';
import { formatCurrency, formatDate, statusClass } from '../lib/utils';
import { Plus, FileText, DollarSign, TrendingUp, Clock, AlertCircle, ArrowRight, Zap, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import MailModal from '../components/MailModal';

export default function DashboardPage() {
    const { getToken } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mailInvoice, setMailInvoice] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const res = await invoiceApi.list();
            setInvoices(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            const res = await invoiceApi.update(id, { status: newStatus });
            setInvoices(prev => prev.map(inv => inv._id === id ? res.data.data : inv));
            toast.success('Status updated');
        } catch {
            toast.error('Failed to update status');
        }
    };

    const handleSend = (inv) => {
        setMailInvoice(inv);
    };

    // Stats
    const total = invoices.reduce((s, i) => s + (i.total || 0), 0);
    const paid = invoices.filter(i => i.status === 'paid');
    const unpaid = invoices.filter(i => i.status === 'unpaid');
    const overdue = invoices.filter(i => i.status === 'overdue');
    const draft = invoices.filter(i => i.status === 'draft');
    const paidAmount = paid.reduce((s, i) => s + i.total, 0);
    const pendingAmount = [...unpaid, ...overdue].reduce((s, i) => s + i.total, 0);

    const STATS = [
        { label: 'Total Revenue', value: formatCurrency(paidAmount), sub: `${paid.length} paid invoices`, icon: DollarSign, color: '#34D399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
        { label: 'Pending Amount', value: formatCurrency(pendingAmount), sub: `${unpaid.length + overdue.length} awaiting`, icon: Clock, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
        { label: 'Total Invoices', value: invoices.length, sub: `${draft.length} drafts`, icon: FileText, color: '#818CF8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.2)' },
        { label: 'Overdue', value: overdue.length, sub: formatCurrency(overdue.reduce((s, i) => s + i.total, 0)), icon: AlertCircle, color: '#F87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
    ];

    const recentInvoices = [...invoices].slice(0, 6);

    return (
        <div style={{ padding: '40px 40px', minHeight: '100vh' }} className="slide-up">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 className="section-title" style={{ fontSize: '1.8rem', marginBottom: 6 }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Overview of your invoicing activity</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Link to="/create?mode=ai" className="btn-secondary">
                        <Zap size={16} />
                        AI Generate
                    </Link>
                    <Link to="/create" className="btn-primary">
                        <Plus size={16} />
                        New Invoice
                    </Link>
                </div>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 40 }}>
                {STATS.map(({ label, value, sub, icon: Icon, color, bg, border }) => (
                    <div key={label} className="stat-card" style={{ background: bg, border: `1px solid ${border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                            </div>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}25` }}>
                                <Icon size={18} color={color} />
                            </div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sub}</div>
                    </div>
                ))}
            </div>

            {/* Recent Invoices */}
            <div className="glass" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Invoices</h2>
                    <Link to="/invoices" style={{ fontSize: '0.825rem', color: '#818CF8', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                        View all <ArrowRight size={14} />
                    </Link>
                </div>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                        <div className="spinner" />
                    </div>
                ) : recentInvoices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <FileText size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
                        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>No invoices yet. Create your first one!</p>
                        <Link to="/create" className="btn-primary">
                            <Plus size={16} /> Create Invoice
                        </Link>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Client</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentInvoices.map(inv => (
                                    <tr key={inv._id}>
                                        <td>
                                            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#818CF8' }}>{inv.invoiceNumber}</span>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{inv.client?.name || '—'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.client?.email}</div>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 700 }}>{formatCurrency(inv.total, inv.currency)}</span>
                                        </td>
                                        <td>
                                            <select
                                                className={`badge ${statusClass(inv.status)}`}
                                                value={inv.status}
                                                onChange={(e) => handleStatusChange(inv._id, e.target.value)}
                                                style={{ border: 'none', cursor: 'pointer', appearance: 'none', textAlign: 'center', minWidth: 90 }}
                                            >
                                                <option value="draft">Draft</option>
                                                <option value="unpaid">Unpaid</option>
                                                <option value="paid">Paid</option>
                                                <option value="overdue">Overdue</option>
                                            </select>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)' }}>{formatDate(inv.issueDate || inv.issuedDate)}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <Link to={`/invoices/${inv._id}`} style={{ color: '#818CF8', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    View <ArrowRight size={12} />
                                                </Link>
                                                <button
                                                    onClick={() => handleSend(inv)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10B981', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
                                                    title="Send Email"
                                                >
                                                    <Mail size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Status breakdown */}
            {invoices.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginTop: 24 }}>
                    {[
                        { label: 'Draft', count: draft.length, color: '#A09DB5' },
                        { label: 'Unpaid', count: unpaid.length, color: '#FCD34D' },
                        { label: 'Paid', count: paid.length, color: '#34D399' },
                        { label: 'Overdue', count: overdue.length, color: '#F87171' },
                    ].map(({ label, count, color }) => (
                        <div key={label} style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14,
                            padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{label}</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 800, color }}>{count}</span>
                        </div>
                    ))}
                </div>
            )}

            <MailModal
                isOpen={!!mailInvoice}
                onClose={() => setMailInvoice(null)}
                invoice={mailInvoice}
            />
        </div>
    );
}
