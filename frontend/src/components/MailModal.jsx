import React, { useState } from 'react';
import { X, Send, Mail, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { invoiceApi } from '../lib/api';

export default function MailModal({ isOpen, onClose, invoice }) {
    const [form, setForm] = useState({
        toEmail: invoice?.client?.email || '',
        subject: `Invoice ${invoice?.invoiceNumber} from ${invoice?.fromBusinessName}`,
        message: `Hello ${invoice?.client?.name || 'Customer'},\n\nPlease find your invoice ${invoice?.invoiceNumber} for ${invoice?.currency} ${invoice?.total} attached.\n\nThank you for your business!`,
    });
    const [sending, setSending] = useState(false);

    if (!isOpen) return null;

    const handleSend = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const res = await invoiceApi.send(invoice._id, form);
            toast.success('Invoice sent successfully!');
            if (res.data.preview) {
                console.log('Email Preview URL:', res.data.preview);
            }
            onClose();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to send email');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content slide-up" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Mail size={18} color="#818CF8" />
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Send Invoice</h3>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSend} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label className="form-label">Recipient Email</label>
                        <input
                            required
                            type="email"
                            className="input-field"
                            value={form.toEmail}
                            onChange={e => setForm({ ...form, toEmail: e.target.value })}
                            placeholder="customer@example.com"
                        />
                    </div>
                    <div>
                        <label className="form-label">Subject</label>
                        <input
                            required
                            className="input-field"
                            value={form.subject}
                            onChange={e => setForm({ ...form, subject: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="form-label">Message Body</label>
                        <textarea
                            required
                            className="textarea-field"
                            rows={6}
                            value={form.message}
                            onChange={e => setForm({ ...form, message: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                        <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ flex: 1 }}
                            disabled={sending}
                        >
                            {sending ? <Loader2 size={18} className="spinner" /> : <Send size={16} />}
                            {sending ? 'Sending...' : 'Send Invoice'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
