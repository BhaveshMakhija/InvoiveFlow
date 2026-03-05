import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { invoiceApi } from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import { ArrowLeft, Printer, Edit, Trash2, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InvoiceDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        invoiceApi.getById(id)
            .then(res => setInvoice(res.data.data))
            .catch(() => toast.error('Invoice not found'))
            .finally(() => setLoading(false));
    }, [id]);

    const handlePrint = () => window.print();

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await invoiceApi.delete(id);
            toast.success('Invoice deleted');
            navigate('/invoices');
        } catch {
            toast.error('Delete failed');
            setDeleting(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const res = await invoiceApi.update(id, { status: newStatus });
            setInvoice(res.data.data);
            toast.success('Status updated');
        } catch {
            toast.error('Failed to update status');
        }
    };

    const statusColors = {
        paid: { bg: 'rgba(16,185,129,0.12)', color: '#34D399', border: 'rgba(16,185,129,0.3)' },
        unpaid: { bg: 'rgba(245,158,11,0.12)', color: '#FCD34D', border: 'rgba(245,158,11,0.3)' },
        overdue: { bg: 'rgba(239,68,68,0.12)', color: '#F87171', border: 'rgba(239,68,68,0.3)' },
        draft: { bg: 'rgba(107,104,128,0.12)', color: '#A09DB5', border: 'rgba(107,104,128,0.3)' },
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
        );
    }

    if (!invoice) {
        return (
            <div style={{ textAlign: 'center', padding: 80 }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Invoice not found.</p>
                <Link to="/invoices" className="btn-secondary">Back to Invoices</Link>
            </div>
        );
    }

    const sc = statusColors[invoice.status] || statusColors.draft;
    const items = invoice.items || [];

    return (
        <div style={{ padding: '40px', minHeight: '100vh', maxWidth: 960, margin: '0 auto' }}>
            {/* Top bar — no-print */}
            <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => navigate(-1)} className="btn-secondary" style={{ padding: '8px 12px' }}>
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{invoice.invoiceNumber}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            <select
                                value={invoice.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                style={{
                                    padding: '3px 24px 3px 12px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700,
                                    background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, textTransform: 'uppercase', letterSpacing: '0.06em',
                                    appearance: 'none', cursor: 'pointer', outline: 'none'
                                }}
                            >
                                <option value="draft">Draft</option>
                                <option value="unpaid">Unpaid</option>
                                <option value="paid">Paid</option>
                                <option value="overdue">Overdue</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-secondary" onClick={() => navigate(`/create?edit=${id}`)}>
                        <Edit size={15} /> Edit
                    </button>
                    <button className="btn-secondary" onClick={handlePrint}>
                        <Printer size={15} /> Print / PDF
                    </button>
                    <button
                        className="btn-danger"
                        onClick={() => setConfirmDelete(true)}
                    >
                        <Trash2 size={15} /> Delete
                    </button>
                </div>
            </div>

            {/* Print area */}
            <div id="print-area">
                <div className="print-preview-container">
                    {/* Header */}
                    <div className="print-preview-header">
                        {/* Left: business info */}
                        <div className="print-preview-company-info">
                            {invoice.logoDataUrl && (
                                <img src={invoice.logoDataUrl} alt="logo" className="print-preview-logo" />
                            )}
                            <div style={{ fontWeight: 800, fontSize: 18, color: '#1a1a1a', marginBottom: 4 }}>
                                {invoice.fromBusinessName || 'Your Business'}
                            </div>
                            {invoice.fromAddress && (
                                <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5, whiteSpace: 'pre-line', marginBottom: 2 }}>{invoice.fromAddress}</div>
                            )}
                            {invoice.fromEmail && <div style={{ fontSize: 12, color: '#555' }}>{invoice.fromEmail}</div>}
                            {invoice.fromPhone && <div style={{ fontSize: 12, color: '#555' }}>{invoice.fromPhone}</div>}
                            {invoice.fromGst && <div style={{ fontSize: 11, color: '#777', marginTop: 4 }}>GST: {invoice.fromGst}</div>}
                        </div>

                        {/* Right: invoice info */}
                        <div className="print-preview-invoice-info">
                            <div style={{ fontSize: 28, fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.02em', marginBottom: 8 }}>INVOICE</div>
                            <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>
                                <span style={{ fontWeight: 600 }}># </span>{invoice.invoiceNumber}
                            </div>
                            <div style={{ fontSize: 12, color: '#777', marginBottom: 2 }}>
                                Issued: {formatDate(invoice.issueDate || invoice.issuedDate)}
                            </div>
                            {invoice.dueDate && (
                                <div style={{ fontSize: 12, color: '#777' }}>Due: {formatDate(invoice.dueDate)}</div>
                            )}
                            <div style={{ marginTop: 12, padding: '4px 14px', borderRadius: 999, display: 'inline-block', background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                                {invoice.status}
                            </div>
                        </div>
                    </div>

                    {/* Bill To */}
                    <div className="print-preview-section">
                        <div style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: 8 }}>Bill To</div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a', marginBottom: 2 }}>{invoice.client?.name || '—'}</div>
                        {invoice.client?.email && <div style={{ fontSize: 12, color: '#555' }}>{invoice.client.email}</div>}
                        {invoice.client?.phone && <div style={{ fontSize: 12, color: '#555' }}>{invoice.client.phone}</div>}
                        {invoice.client?.address && <div className="print-preview-address" style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{invoice.client.address}</div>}
                    </div>

                    {/* Items table */}
                    <table className="print-preview-table">
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={{ width: '5%' }}>#</th>
                                <th>Description</th>
                                <th style={{ textAlign: 'right', width: '10%' }}>Qty</th>
                                <th style={{ textAlign: 'right', width: '18%' }}>Unit Price</th>
                                <th style={{ textAlign: 'right', width: '18%' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, i) => {
                                const q = Number(item.quantity || item.qty || 0);
                                const p = Number(item.unitPrice ?? item.unitprice ?? item.unit_price ?? 0);
                                const amt = q * p;
                                return (
                                    <tr key={item.id || i}>
                                        <td style={{ color: '#888' }}>{i + 1}</td>
                                        <td>{item.description || '—'}</td>
                                        <td style={{ textAlign: 'right' }}>{item.quantity || item.qty || 1}</td>
                                        <td style={{ textAlign: 'right' }}>{formatCurrency(item.unitPrice ?? item.unitprice ?? item.unit_price ?? 0, invoice.currency)}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(amt, invoice.currency)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="print-preview-flex">
                        {/* Notes + Signature */}
                        <div style={{ flex: 1 }}>
                            {invoice.notes && (
                                <div className="print-preview-section">
                                    <div style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: 8 }}>Notes</div>
                                    <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{invoice.notes}</div>
                                </div>
                            )}
                            {(invoice.signatureDataUrl || invoice.signatureName) && (
                                <div style={{ marginTop: 32 }}>
                                    {invoice.signatureDataUrl && (
                                        <img src={invoice.signatureDataUrl} alt="signature" className="print-preview-signature" style={{ display: 'block', marginBottom: 4 }} />
                                    )}
                                    <div style={{ height: 1, width: 160, background: '#d1d5db', marginBottom: 4 }} />
                                    {invoice.signatureName && <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a' }}>{invoice.signatureName}</div>}
                                    {invoice.signatureTitle && <div style={{ fontSize: 11, color: '#777' }}>{invoice.signatureTitle}</div>}
                                </div>
                            )}
                        </div>

                        {/* Totals block */}
                        <div style={{ minWidth: 240 }}>
                            <div className="print-preview-totals">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                                    <span style={{ color: '#555' }}>Subtotal</span>
                                    <span style={{ fontWeight: 600 }}>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                                    <span style={{ color: '#555' }}>Tax ({invoice.taxPercent || 0}%)</span>
                                    <span style={{ fontWeight: 600 }}>{formatCurrency(invoice.tax, invoice.currency)}</span>
                                </div>
                                <div style={{ height: 1, background: '#d1d5db', margin: '8px 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800 }}>
                                    <span>Total</span>
                                    <span style={{ color: '#1a1a1a' }}>{formatCurrency(invoice.total, invoice.currency)}</span>
                                </div>
                            </div>

                            {/* Stamp */}
                            {invoice.stampDataUrl && (
                                <div style={{ textAlign: 'right', marginTop: 16 }}>
                                    <img src={invoice.stampDataUrl} alt="stamp" className="print-preview-stamp" style={{ marginLeft: 'auto' }} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete confirm modal */}
            {confirmDelete && (
                <div className="modal-overlay" onClick={() => setConfirmDelete(false)}>
                    <div className="modal-content" style={{ maxWidth: 420, padding: 32 }} onClick={e => e.stopPropagation()}>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '1px solid rgba(239,68,68,0.2)' }}>
                                <Trash2 size={24} color="#F87171" />
                            </div>
                            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Delete this invoice?</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>This cannot be undone.</p>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setConfirmDelete(false)}>Cancel</button>
                            <button
                                onClick={handleDelete} disabled={deleting}
                                style={{ flex: 1, padding: '10px 20px', borderRadius: 12, fontWeight: 600, fontSize: '0.875rem', background: 'linear-gradient(135deg, #EF4444, #DC2626)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                            >
                                {deleting ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <Trash2 size={14} />}
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
