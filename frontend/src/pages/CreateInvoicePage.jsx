import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { invoiceApi, aiApi, businessApi } from '../lib/api';
import { generateId, computeTotals, formatCurrency } from '../lib/utils';
import {
    Plus, Trash2, Sparkles, FileText, ChevronDown, Upload, X,
    ArrowLeft, Save, Loader2, Zap, User, Building, Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'];
const STATUSES = ['draft', 'unpaid', 'paid', 'overdue'];

function emptyItem() {
    return { id: generateId(), description: '', quantity: 1, unitPrice: 0 };
}

function emptyForm() {
    return {
        invoiceNumber: '',
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: '',
        fromBusinessName: '', fromEmail: '', fromAddress: '', fromPhone: '', fromGst: '',
        clientName: '', clientEmail: '', clientAddress: '', clientPhone: '',
        items: [emptyItem()],
        taxPercent: 18,
        currency: 'INR',
        status: 'draft',
        notes: '',
        logoDataUrl: null, stampDataUrl: null, signatureDataUrl: null,
        signatureName: '', signatureTitle: '',
    };
}

export default function CreateInvoicePage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const editId = searchParams.get('edit');
    const isAiMode = searchParams.get('mode') === 'ai';
    const [tab, setTab] = useState(isAiMode ? 'ai' : 'manual');
    const [form, setForm] = useState(emptyForm());
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [profiles, setProfiles] = useState([]);
    const [initialLoading, setInitialLoading] = useState(!!editId);

    // Load initial data
    useEffect(() => {
        async function loadData() {
            try {
                const bRes = await businessApi.getMyProfile();
                const plist = bRes.data.profiles || [];
                setProfiles(plist);

                // If editing, load the invoice
                if (editId) {
                    const iRes = await invoiceApi.getById(editId);
                    const inv = iRes.data.data;
                    if (inv) {
                        setForm({
                            invoiceNumber: inv.invoiceNumber || '',
                            issueDate: (inv.issueDate || inv.issuedDate || '').slice(0, 10),
                            dueDate: (inv.dueDate || '').slice(0, 10),
                            fromBusinessName: inv.fromBusinessName || '',
                            fromEmail: inv.fromEmail || '',
                            fromAddress: inv.fromAddress || '',
                            fromPhone: inv.fromPhone || '',
                            fromGst: inv.fromGst || '',
                            clientName: inv.client?.name || '',
                            clientEmail: inv.client?.email || '',
                            clientAddress: inv.client?.address || '',
                            clientPhone: inv.client?.phone || '',
                            items: (inv.items && inv.items.length > 0)
                                ? inv.items.map(it => ({
                                    id: it.id || it._id || generateId(),
                                    description: it.description || '',
                                    quantity: it.quantity || it.qty || 1,
                                    unitPrice: it.unitPrice ?? it.unitprice ?? it.unit_price ?? 0,
                                }))
                                : [emptyItem()],
                            taxPercent: inv.taxPercent ?? 18,
                            currency: inv.currency || 'INR',
                            status: inv.status || 'draft',
                            notes: inv.notes || '',
                            logoDataUrl: inv.logoDataUrl || null,
                            stampDataUrl: inv.stampDataUrl || null,
                            signatureDataUrl: inv.signatureDataUrl || null,
                            signatureName: inv.signatureName || '',
                            signatureTitle: inv.signatureTitle || '',
                        });
                        setTab('manual');
                    }
                } else if (plist.length > 0) {
                    // prefill with first profile if creating new
                    const p = plist[0];
                    setForm(f => ({
                        ...f,
                        fromBusinessName: p.businessName || '',
                        fromEmail: p.email || '',
                        fromAddress: p.address || '',
                        fromPhone: p.phone || '',
                        fromGst: p.gst || '',
                        taxPercent: p.defaultTaxPercent ?? 18,
                        logoDataUrl: p.logoUrl || null,
                        stampDataUrl: p.stampUrl || null,
                        signatureDataUrl: p.signatureUrl || null,
                        signatureName: p.signatureOwnerName || p.signatureOwnername || '',
                        signatureTitle: p.signatureOwnerTitle || '',
                    }));
                }
            } catch (err) {
                console.error("Load failed", err);
            } finally {
                setInitialLoading(false);
            }
        }
        loadData();
    }, [editId]);

    const handleProfileSelect = (e) => {
        const id = e.target.value;
        const p = profiles.find(x => x._id === id);
        if (p) {
            setForm(f => ({
                ...f,
                fromBusinessName: p.businessName || '',
                fromEmail: p.email || '',
                fromAddress: p.address || '',
                fromPhone: p.phone || '',
                fromGst: p.gst || '',
                taxPercent: p.defaultTaxPercent ?? f.taxPercent,
                logoDataUrl: p.logoUrl || null,
                stampDataUrl: p.stampUrl || null,
                signatureDataUrl: p.signatureUrl || null,
                signatureName: p.signatureOwnerName || p.signatureOwnername || '',
                signatureTitle: p.signatureOwnerTitle || '',
            }));
            toast.success('Applied ' + p.businessName);
        }
    };

    const totals = computeTotals(form.items, form.taxPercent);

    // Field update helpers
    const set = (field, value) => setForm(f => ({ ...f, [field]: value }));
    const setItem = (id, field, value) =>
        setForm(f => ({ ...f, items: f.items.map(it => it.id === id ? { ...it, [field]: value } : it) }));
    const addItem = () => setForm(f => ({ ...f, items: [...f.items, emptyItem()] }));
    const removeItem = (id) => setForm(f => ({ ...f, items: f.items.filter(it => it.id !== id) }));

    // AI Generation
    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) return toast.error('Please enter a prompt');
        setAiLoading(true);
        try {
            const res = await aiApi.generateInvoice(aiPrompt);
            const data = res.data.data;
            const mappedItems = (data.items || []).map(it => ({
                id: generateId(),
                description: it.description || '',
                quantity: Number(it.qty || it.quantity || 1),
                unitPrice: Number(it.unitPrice || it.unit_price || 0),
            }));
            setForm(f => ({
                ...f,
                invoiceNumber: data.invoiceNumber || f.invoiceNumber,
                issueDate: data.issueDate || f.issueDate,
                dueDate: data.dueDate || '',
                fromBusinessName: data.fromBusinessName || f.fromBusinessName,
                fromEmail: data.fromEmail || f.fromEmail,
                fromAddress: data.fromAddress || f.fromAddress,
                fromPhone: data.fromPhone || f.fromPhone,
                clientName: data.client?.name || '',
                clientEmail: data.client?.email || '',
                clientAddress: data.client?.address || '',
                clientPhone: data.client?.phone || '',
                items: mappedItems.length ? mappedItems : [emptyItem()],
                taxPercent: Number(data.taxPercent ?? f.taxPercent),
                notes: data.notes || '',
            }));
            toast.success(`Invoice generated! (${res.data.model || 'AI'})`);
            setTab('review');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'AI generation failed');
        } finally {
            setAiLoading(false);
        }
    };

    // File to base64
    const handleFileUpload = async (e, field) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => set(field, reader.result);
        reader.readAsDataURL(file);
    };

    // Save invoice
    const handleSave = async (statusOverride) => {
        setSaving(true);
        try {
            const payload = {
                invoiceNumber: form.invoiceNumber || undefined,
                issueDate: form.issueDate,
                dueDate: form.dueDate,
                fromBusinessName: form.fromBusinessName,
                fromEmail: form.fromEmail,
                fromAddress: form.fromAddress,
                fromPhone: form.fromPhone,
                fromGst: form.fromGst,
                client: {
                    name: form.clientName,
                    email: form.clientEmail,
                    address: form.clientAddress,
                    phone: form.clientPhone,
                },
                items: form.items.map(it => ({
                    id: it.id,
                    description: it.description,
                    quantity: Number(it.quantity),
                    unitPrice: Number(it.unitPrice),
                    unitprice: Number(it.unitPrice),
                })),
                taxPercent: Number(form.taxPercent),
                currency: form.currency,
                status: statusOverride || form.status,
                notes: form.notes,
                logoDataUrl: form.logoDataUrl,
                stampDataUrl: form.stampDataUrl,
                signatureDataUrl: form.signatureDataUrl,
                signatureName: form.signatureName,
                signatureTitle: form.signatureTitle,
            };

            let res;
            if (editId) {
                res = await invoiceApi.update(editId, payload);
                toast.success('Invoice updated!');
            } else {
                res = await invoiceApi.create(payload);
                toast.success('Invoice saved!');
            }
            navigate(`/invoices/${res.data.data._id}`);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const TAB_STYLE = (active) => ({
        padding: '10px 20px', borderRadius: 10, fontSize: '0.875rem', fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.2s', border: 'none',
        background: active ? 'rgba(79,70,229,0.15)' : 'transparent',
        color: active ? '#818CF8' : 'var(--text-muted)',
        borderBottom: active ? '2px solid #818CF8' : '2px solid transparent',
    });

    return (
        <div style={{ padding: '40px', minHeight: '100vh', maxWidth: 1000, margin: '0 auto' }} className="slide-up">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                <button onClick={() => navigate(-1)} className="btn-secondary" style={{ padding: '8px 12px' }}>
                    <ArrowLeft size={16} />
                </button>
                <div>
                    <h1 className="section-title" style={{ fontSize: '1.6rem' }}>{editId ? 'Edit Invoice' : 'Create Invoice'}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{editId ? 'Update your draft invoice' : 'Fill manually or use AI to auto-fill'}</p>
                </div>
            </div>

            {initialLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
                    <div className="spinner" style={{ width: 32, height: 32 }} />
                </div>
            ) : (
                <>
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: 'var(--bg-card)', borderRadius: 14, padding: 6, border: '1px solid var(--border)', width: 'fit-content' }}>
                        <button style={TAB_STYLE(tab === 'ai')} onClick={() => setTab('ai')} id="tab-ai">
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Sparkles size={15} /> AI Generate
                            </span>
                        </button>
                        <button style={TAB_STYLE(tab === 'manual')} onClick={() => setTab('manual')} id="tab-manual">
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FileText size={15} /> Manual
                            </span>
                        </button>
                        {tab === 'review' && (
                            <button style={TAB_STYLE(true)} id="tab-review">
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>✨ Review & Save</span>
                            </button>
                        )}
                    </div>

                    {/* AI Tab */}
                    {tab === 'ai' && (
                        <div className="glass" style={{ padding: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(6,182,212,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(79,70,229,0.2)' }}>
                                    <Zap size={20} color="#818CF8" />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>AI Invoice Generator</h2>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Describe your invoice in plain English</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label className="form-label">Describe your invoice</label>
                                <textarea
                                    className="textarea-field ai-textarea"
                                    rows={5}
                                    placeholder={`Examples:\n• "Invoice for web design services, 20 hours @ ₹3000/hr for TechCorp Ltd. 18% GST, due in 30 days"\n• "Monthly retainer invoice of $5000 for Digital Marketing services for Acme Inc"`}
                                    value={aiPrompt}
                                    onChange={e => setAiPrompt(e.target.value)}
                                    id="ai-prompt"
                                />
                            </div>

                            <div style={{
                                padding: 16, borderRadius: 12, background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)',
                                marginBottom: 24, display: 'flex', gap: 10
                            }}>
                                <Info size={16} color="#06B6D4" style={{ flexShrink: 0, marginTop: 2 }} />
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                    The AI will auto-fill invoice fields based on your prompt. You can review and edit all fields before saving.
                                </p>
                            </div>

                            <button
                                className="btn-primary"
                                onClick={handleAiGenerate}
                                disabled={aiLoading || !aiPrompt.trim()}
                                style={{ padding: '12px 28px', fontSize: '1rem', borderRadius: 14, width: '100%', justifyContent: 'center' }}
                                id="ai-generate-btn"
                            >
                                {aiLoading ? (
                                    <><div className="spinner" style={{ width: 18, height: 18 }} /> Generating...</>
                                ) : (
                                    <><Sparkles size={18} /> Generate Invoice</>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Manual / Review form */}
                    {(tab === 'manual' || tab === 'review') && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            {/* Row 1: Invoice meta */}
                            <div className="glass" style={{ padding: 28 }}>
                                <h3 style={{ fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FileText size={16} color="#818CF8" /> Invoice Details
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                                    <div>
                                        <label className="form-label">Invoice Number</label>
                                        <input className="input-field" placeholder="Auto-generated" value={form.invoiceNumber} onChange={e => set('invoiceNumber', e.target.value)} id="inv-number" />
                                    </div>
                                    <div>
                                        <label className="form-label">Issue Date</label>
                                        <input className="input-field" type="date" value={form.issueDate} onChange={e => set('issueDate', e.target.value)} id="inv-issue-date" />
                                    </div>
                                    <div>
                                        <label className="form-label">Due Date</label>
                                        <input className="input-field" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} id="inv-due-date" />
                                    </div>
                                    <div>
                                        <label className="form-label">Currency</label>
                                        <select className="select-field" value={form.currency} onChange={e => set('currency', e.target.value)} id="inv-currency">
                                            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">Status</label>
                                        <select className="select-field" value={form.status} onChange={e => set('status', e.target.value)} id="inv-status">
                                            {STATUSES.map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: From / To */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                {/* From */}
                                <div className="glass" style={{ padding: 28 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                        <h3 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Building size={16} color="#06B6D4" /> From (Your Business)
                                        </h3>
                                        {profiles.length > 0 && (
                                            <select className="select-field" style={{ padding: '4px 10px', fontSize: '0.8rem', minWidth: 140 }} onChange={handleProfileSelect} defaultValue="">
                                                <option value="" disabled>Apply Profile...</option>
                                                {profiles.map(p => (
                                                    <option key={p._id} value={p._id}>{p.businessName || 'Unnamed Profile'}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div>
                                            <label className="form-label">Business Name</label>
                                            <input className="input-field" placeholder="Your Company" value={form.fromBusinessName} onChange={e => set('fromBusinessName', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="form-label">Email</label>
                                            <input className="input-field" type="email" placeholder="you@company.com" value={form.fromEmail} onChange={e => set('fromEmail', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="form-label">Address</label>
                                            <textarea className="textarea-field" rows={2} placeholder="123 Business St, City" value={form.fromAddress} onChange={e => set('fromAddress', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="form-label">Phone</label>
                                            <input className="input-field" placeholder="+91 9999999999" value={form.fromPhone} onChange={e => set('fromPhone', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="form-label">GST / Tax ID</label>
                                            <input className="input-field" placeholder="22AAAAA0000A1Z5" value={form.fromGst} onChange={e => set('fromGst', e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                {/* To */}
                                <div className="glass" style={{ padding: 28 }}>
                                    <h3 style={{ fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <User size={16} color="#34D399" /> Bill To (Client)
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div>
                                            <label className="form-label">Client Name</label>
                                            <input className="input-field" placeholder="Client Name" value={form.clientName} onChange={e => set('clientName', e.target.value)} id="client-name" />
                                        </div>
                                        <div>
                                            <label className="form-label">Client Email</label>
                                            <input className="input-field" type="email" placeholder="client@company.com" value={form.clientEmail} onChange={e => set('clientEmail', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="form-label">Address</label>
                                            <textarea className="textarea-field" rows={2} placeholder="Client address" value={form.clientAddress} onChange={e => set('clientAddress', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="form-label">Phone</label>
                                            <input className="input-field" placeholder="+91 9999999999" value={form.clientPhone} onChange={e => set('clientPhone', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="glass" style={{ padding: 28 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <h3 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <FileText size={16} color="#F59E0B" /> Line Items
                                    </h3>
                                    <button className="btn-secondary" onClick={addItem} style={{ padding: '7px 14px' }}>
                                        <Plus size={15} /> Add Item
                                    </button>
                                </div>

                                {/* Header row */}
                                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                                    {['Description', 'Qty', 'Unit Price', 'Amount', ''].map(h => (
                                        <div key={h} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
                                    ))}
                                </div>

                                {form.items.map((item) => {
                                    const amount = Number(item.quantity) * Number(item.unitPrice);
                                    return (
                                        <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                                            <input className="input-field" placeholder="Service description" value={item.description} onChange={e => setItem(item.id, 'description', e.target.value)} />
                                            <input className="input-field" type="number" min="1" value={item.quantity} onChange={e => setItem(item.id, 'quantity', e.target.value)} />
                                            <input className="input-field" type="number" min="0" step="0.01" placeholder="0.00" value={item.unitPrice} onChange={e => setItem(item.id, 'unitPrice', e.target.value)} />
                                            <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                {formatCurrency(amount, form.currency)}
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                disabled={form.items.length <= 1}
                                                style={{ width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#F87171', cursor: form.items.length <= 1 ? 'not-allowed' : 'pointer', opacity: form.items.length <= 1 ? 0.4 : 1 }}
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    );
                                })}

                                {/* Tax + Totals */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                                    <div style={{ minWidth: 280, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 14, padding: 20 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Subtotal</span>
                                            <span style={{ fontWeight: 600 }}>{formatCurrency(totals.subtotal, form.currency)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Tax</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <input
                                                        type="number" min="0" max="100"
                                                        value={form.taxPercent}
                                                        onChange={e => set('taxPercent', e.target.value)}
                                                        style={{ width: 52, padding: '4px 8px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', fontSize: '0.8rem', textAlign: 'center', outline: 'none' }}
                                                    />
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>%</span>
                                                </div>
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{formatCurrency(totals.tax, form.currency)}</span>
                                        </div>
                                        <div style={{ height: 1, background: 'var(--border)', marginBottom: 12 }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Total</span>
                                            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#34D399' }}>{formatCurrency(totals.total, form.currency)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes & Branding */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                {/* Notes */}
                                <div className="glass" style={{ padding: 28 }}>
                                    <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Notes</h3>
                                    <textarea className="textarea-field" rows={4} placeholder="Payment terms, thank you note, bank details..." value={form.notes} onChange={e => set('notes', e.target.value)} />
                                </div>

                                {/* Branding & Upload */}
                                <div className="glass" style={{ padding: 28 }}>
                                    <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Branding</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {[
                                            { label: 'Logo', field: 'logoDataUrl' },
                                            { label: 'Stamp', field: 'stampDataUrl' },
                                            { label: 'Signature', field: 'signatureDataUrl' },
                                        ].map(({ label, field }) => (
                                            <div key={field}>
                                                <label className="form-label">{label}</label>
                                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                    <label style={{
                                                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                                                        background: 'rgba(255,255,255,0.04)', border: '1px dashed var(--border)',
                                                        borderRadius: 10, cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-muted)',
                                                        transition: 'all 0.2s', flex: 1
                                                    }}>
                                                        <Upload size={14} /> Upload {label}
                                                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileUpload(e, field)} />
                                                    </label>
                                                    {form[field] && (
                                                        <div style={{ position: 'relative', display: 'inline-flex' }}>
                                                            <img src={form[field]} alt={label} style={{ height: 36, maxWidth: 80, objectFit: 'contain', borderRadius: 6, border: '1px solid var(--border)' }} />
                                                            <button onClick={() => set(field, null)} style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#F87171', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <X size={10} color="white" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                            <div>
                                                <label className="form-label">Signatory Name</label>
                                                <input className="input-field" placeholder="John Doe" value={form.signatureName} onChange={e => set('signatureName', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="form-label">Title</label>
                                                <input className="input-field" placeholder="CEO" value={form.signatureTitle} onChange={e => set('signatureTitle', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Save buttons */}
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                                <button className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
                                <button className="btn-secondary" onClick={() => handleSave('draft')} disabled={saving || form.status !== 'draft'}>
                                    {saving ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <Save size={15} />}
                                    Save as Draft
                                </button>
                                <button className="btn-primary" onClick={() => handleSave()} disabled={saving} id="save-invoice-btn">
                                    {saving ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <Save size={15} />}
                                    {saving ? 'Saving...' : (editId ? 'Update Invoice' : 'Save Invoice')}
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
