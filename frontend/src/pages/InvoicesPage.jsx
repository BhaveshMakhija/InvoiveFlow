import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { invoiceApi } from '../lib/api';
import { formatCurrency, formatDate, statusClass, debounce } from '../lib/utils';
import { Plus, Search, Filter, Trash2, Eye, FileText, ChevronDown, Zap, Mail, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import MailModal from '../components/MailModal';

const STATUSES = ['all', 'draft', 'unpaid', 'paid', 'overdue'];

export default function InvoicesPage() {
    const { getToken } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteId, setDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [mailInvoice, setMailInvoice] = useState(null);

    const fetchInvoices = useCallback(async (q = '') => {
        try {
            const params = {};
            if (q) params.search = q;
            if (statusFilter !== 'all') params.status = statusFilter;
            const res = await invoiceApi.list(params);
            setInvoices(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load invoices');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => { fetchInvoices(search); }, [statusFilter]);

    const debouncedSearch = useCallback(
        debounce((val) => fetchInvoices(val), 400),
        [fetchInvoices]
    );

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        debouncedSearch(e.target.value);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setDeleting(true);
        try {
            await invoiceApi.delete(deleteId);
            toast.success('Invoice deleted');
            setInvoices(prev => prev.filter(i => i._id !== deleteId));
            setDeleteId(null);
        } catch {
            toast.error('Delete failed');
        } finally {
            setDeleting(false);
        }
    };

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

    return (
        <div style={{ padding: '40px', minHeight: '100vh' }} className="slide-up">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 className="section-title" style={{ fontSize: '1.8rem', marginBottom: 6 }}>Invoices</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{invoices.length} invoice{invoices.length !== 1 ? 's' : ''} found</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Link to="/create?mode=ai" className="btn-secondary">
                        <Zap size={16} /> AI Generate
                    </Link>
                    <Link to="/create" className="btn-primary">
                        <Plus size={16} /> New Invoice
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        className="input-field"
                        placeholder="Search by invoice #, client name, or email..."
                        value={search}
                        onChange={handleSearchChange}
                        style={{ paddingLeft: 38 }}
                        id="inv-search"
                    />
                </div>

                {/* Status filter */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {STATUSES.map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            style={{
                                padding: '8px 16px', borderRadius: 10, fontSize: '0.825rem', fontWeight: 500,
                                cursor: 'pointer', transition: 'all 0.2s',
                                background: statusFilter === s ? 'rgba(79,70,229,0.15)' : 'rgba(255,255,255,0.04)',
                                border: statusFilter === s ? '1px solid rgba(79,70,229,0.4)' : '1px solid var(--border)',
                                color: statusFilter === s ? '#818CF8' : 'var(--text-secondary)',
                            }}
                        >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="glass" style={{ overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
                        <div className="spinner" />
                    </div>
                ) : invoices.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 40px' }}>
                        <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto 20px' }} />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>No invoices found</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: '0.875rem' }}>
                            {search || statusFilter !== 'all' ? 'Try adjusting your search or filter.' : 'Create your first invoice to get started.'}
                        </p>
                        {!search && statusFilter === 'all' && (
                            <Link to="/create" className="btn-primary">
                                <Plus size={16} /> Create Invoice
                            </Link>
                        )}
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Client</th>
                                    <th>Issue Date</th>
                                    <th>Due Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map(inv => (
                                    <tr key={inv._id}>
                                        <td>
                                            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#818CF8', fontWeight: 600 }}>
                                                {inv.invoiceNumber}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{inv.client?.name || '—'}</div>
                                            {inv.client?.email && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.client.email}</div>
                                            )}
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formatDate(inv.issueDate || inv.issuedDate)}</td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                            {inv.dueDate ? formatDate(inv.dueDate) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{formatCurrency(inv.total, inv.currency)}</span>
                                        </td>
                                        <td>
                                            <select
                                                className={`badge ${statusClass(inv.status)}`}
                                                value={inv.status}
                                                onChange={(e) => handleStatusChange(inv._id, e.target.value)}
                                                style={{ border: 'none', cursor: 'pointer', appearance: 'none', textAlign: 'center', width: '100%', minWidth: 90 }}
                                            >
                                                <option value="draft">Draft</option>
                                                <option value="unpaid">Unpaid</option>
                                                <option value="paid">Paid</option>
                                                <option value="overdue">Overdue</option>
                                            </select>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <Link
                                                    to={`/invoices/${inv._id}`}
                                                    style={{
                                                        width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.2)',
                                                        color: '#818CF8', textDecoration: 'none', transition: 'all 0.2s'
                                                    }}
                                                    title="View"
                                                >
                                                    <Eye size={14} />
                                                </Link>
                                                <button
                                                    onClick={() => handleSend(inv)}
                                                    style={{
                                                        width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                                                        color: '#10B981', cursor: 'pointer', transition: 'all 0.2s'
                                                    }}
                                                    title="Send via Email"
                                                >
                                                    <Mail size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(inv._id)}
                                                    style={{
                                                        width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                                        color: '#F87171', cursor: 'pointer', transition: 'all 0.2s'
                                                    }}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
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

            {/* Delete Confirm Modal */}
            {deleteId && (
                <div className="modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="modal-content" style={{ maxWidth: 440, padding: 32 }} onClick={e => e.stopPropagation()}>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <Trash2 size={24} color="#F87171" />
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Delete Invoice?</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>This action cannot be undone. The invoice will be permanently deleted.</p>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteId(null)}>Cancel</button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                style={{
                                    flex: 1, padding: '10px 20px', borderRadius: 12, fontWeight: 600, fontSize: '0.875rem',
                                    background: 'linear-gradient(135deg, #EF4444, #DC2626)', color: '#fff', border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s'
                                }}
                            >
                                {deleting ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <Trash2 size={14} />}
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
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
