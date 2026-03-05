import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { businessApi } from '../lib/api';
import { Building2, Upload, X, Save, Check, AlertCircle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

function emptyForm() {
    return {
        businessName: '', email: '', phone: '', address: '', gst: '',
        defaultTaxPercent: 18,
        signatureOwnerName: '', signatureOwnerTitle: '',
        logo: null, stamp: null, signature: null,
        logoPreview: null, stampPreview: null, signaturePreview: null,
    };
}

export default function BusinessProfilePage() {
    const { getToken } = useAuth();
    const [form, setForm] = useState(emptyForm());
    const [profiles, setProfiles] = useState([]);
    const [profileId, setProfileId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        businessApi.getMyProfile()
            .then(res => {
                const plist = res.data.profiles || [];
                setProfiles(plist);
                if (plist.length > 0) {
                    loadProfileData(plist[0]);
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const loadProfileData = (p) => {
        setProfileId(p?._id || null);
        if (p) {
            setForm(f => ({
                ...f,
                businessName: p.businessName || '',
                email: p.email || '',
                phone: p.phone || '',
                address: p.address || '',
                gst: p.gst || '',
                defaultTaxPercent: p.defaultTaxPercent ?? 18,
                signatureOwnerName: p.signatureOwnerName || p.signatureOwnername || '',
                signatureOwnerTitle: p.signatureOwnerTitle || '',
                logoPreview: p.logoUrl || null,
                stampPreview: p.stampUrl || null,
                signaturePreview: p.signatureUrl || p.signatureurl || null,
            }));
        } else {
            setForm(emptyForm());
        }
    };

    const handleSelectProfile = (e) => {
        const id = e.target.value;
        if (id === 'new') {
            loadProfileData(null);
        } else {
            const p = profiles.find(x => x._id === id);
            loadProfileData(p);
        }
    };

    const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

    const handleFileChange = (e, field, previewField) => {
        const file = e.target.files?.[0];
        if (!file) return;
        set(field, file);
        const reader = new FileReader();
        reader.onload = () => set(previewField, reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const fd = new FormData();
        fd.append('businessName', form.businessName);
        fd.append('email', form.email);
        fd.append('phone', form.phone);
        fd.append('address', form.address);
        fd.append('gst', form.gst);
        fd.append('defaultTaxPercent', String(form.defaultTaxPercent));
        fd.append('signatureOwnerName', form.signatureOwnerName);
        fd.append('signatureOwnerTitle', form.signatureOwnerTitle);

        if (form.logo) fd.append('logoName', form.logo);
        if (form.stamp) fd.append('stampName', form.stamp);
        if (form.signature) fd.append('signatureNameMeta', form.signature);

        try {
            let savedP = null;
            if (profileId) {
                const r = await businessApi.update(profileId, fd);
                savedP = r.data.profile;
            } else {
                const res = await businessApi.create(fd);
                savedP = res.data.profile;
                setProfileId(savedP?._id);
            }
            if (savedP) {
                setProfiles(prev => {
                    const exists = prev.find(x => x._id === savedP._id);
                    if (exists) return prev.map(x => x._id === savedP._id ? savedP : x);
                    return [...prev, savedP];
                });
            }
            toast.success('Business profile saved!');
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="spinner" style={{ width: 32, height: 32 }} />
            </div>
        );
    }

    const FileField = ({ label, field, previewField, hint }) => (
        <div>
            <label className="form-label">{label}</label>
            {hint && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>{hint}</p>}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <label style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
                    background: 'rgba(255,255,255,0.04)', border: '1px dashed var(--border)',
                    borderRadius: 12, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)',
                    transition: 'all 0.2s', whiteSpace: 'nowrap'
                }}>
                    <Upload size={15} /> Upload {label}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileChange(e, field, previewField)} />
                </label>
                {form[previewField] && (
                    <div style={{ position: 'relative', display: 'inline-flex' }}>
                        <img src={form[previewField]} alt={label} style={{ height: 48, maxWidth: 120, objectFit: 'contain', borderRadius: 8, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', padding: 4 }} />
                        <button
                            type="button"
                            onClick={() => { set(field, null); set(previewField, null); }}
                            style={{ position: 'absolute', top: -8, right: -8, width: 20, height: 20, borderRadius: '50%', background: '#F87171', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <X size={11} color="white" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div style={{ padding: '40px', minHeight: '100vh', maxWidth: 800, margin: '0 auto' }} className="slide-up">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 className="section-title" style={{ fontSize: '1.8rem', marginBottom: 6 }}>Business Profile</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage your business profiles</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginLeft: 8 }}>SWITCH PROFILE</span>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <select
                                className="select-field"
                                value={profileId || 'new'}
                                onChange={handleSelectProfile}
                                style={{ background: 'var(--bg-card)', minWidth: 200 }}
                            >
                                {profiles.map(p => (
                                    <option key={p._id} value={p._id}>{p.businessName || 'Unnamed Profile'}</option>
                                ))}
                                <option value="new">Select to create...</option>
                            </select>
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => loadProfileData(null)}
                                style={{ padding: '8px 16px', borderRadius: 10, fontSize: '0.85rem' }}
                            >
                                <Plus size={16} /> Add New
                            </button>
                        </div>
                    </div>
                    {profileId ? (
                        <div style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, fontSize: '0.8rem', color: '#34D399', whiteSpace: 'nowrap' }}>
                            <div className="glow-dot" style={{ width: 6, height: 6, background: '#34D399', boxShadow: '0 0 6px #34D399' }} />
                            Updating Profile
                        </div>
                    ) : (
                        <div style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, fontSize: '0.8rem', color: '#60A5FA', whiteSpace: 'nowrap' }}>
                            <Plus size={14} />
                            New Profile Mode
                        </div>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Business info */}
                <div className="glass" style={{ padding: 32 }}>
                    <h2 style={{ fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(79,70,229,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(79,70,229,0.2)' }}>
                            <Building2 size={18} color="#818CF8" />
                        </div>
                        Business Information
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
                        <div>
                            <label className="form-label">Business Name *</label>
                            <input className="input-field" required placeholder="Acme Solutions Pvt Ltd" value={form.businessName} onChange={e => set('businessName', e.target.value)} id="biz-name" />
                        </div>
                        <div>
                            <label className="form-label">Email *</label>
                            <input className="input-field" required type="email" placeholder="billing@acme.com" value={form.email} onChange={e => set('email', e.target.value)} />
                        </div>
                        <div>
                            <label className="form-label">Phone</label>
                            <input className="input-field" placeholder="+91 9999999999" value={form.phone} onChange={e => set('phone', e.target.value)} />
                        </div>
                        <div>
                            <label className="form-label">GST / Tax ID</label>
                            <input className="input-field" placeholder="22AAAAA0000A1Z5" value={form.gst} onChange={e => set('gst', e.target.value)} />
                        </div>
                        <div>
                            <label className="form-label">Default Tax Rate (%)</label>
                            <input className="input-field" type="number" min="0" max="100" value={form.defaultTaxPercent} onChange={e => set('defaultTaxPercent', e.target.value)} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">Business Address</label>
                            <textarea className="textarea-field" rows={3} placeholder="123 Business Park, Mumbai, Maharashtra 400001" value={form.address} onChange={e => set('address', e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* Branding */}
                <div className="glass" style={{ padding: 32 }}>
                    <h2 style={{ fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(6,182,212,0.2)' }}>
                            <Upload size={18} color="#06B6D4" />
                        </div>
                        Branding & Assets
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 28 }}>
                        These will appear on your printed invoices automatically.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <FileField label="Company Logo" field="logo" previewField="logoPreview" hint="Appears at the top-left of invoices (PNG/JPG recommended)" />
                        <FileField label="Company Stamp" field="stamp" previewField="stampPreview" hint="Official stamp appears at the bottom-right" />
                        <FileField label="Signature" field="signature" previewField="signaturePreview" hint="Authorized signatory signature" />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div>
                                <label className="form-label">Signatory Name</label>
                                <input className="input-field" placeholder="Rajesh Kumar" value={form.signatureOwnerName} onChange={e => set('signatureOwnerName', e.target.value)} />
                            </div>
                            <div>
                                <label className="form-label">Signatory Title</label>
                                <input className="input-field" placeholder="Managing Director" value={form.signatureOwnerTitle} onChange={e => set('signatureOwnerTitle', e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Note */}
                <div style={{ display: 'flex', gap: 10, padding: 16, background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.15)', borderRadius: 12 }}>
                    <AlertCircle size={16} color="#818CF8" style={{ flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        Your business profile is private and only visible to you. All new invoices will be pre-filled with this information.
                    </p>
                </div>

                {/* Save button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={saving}
                        style={{ padding: '12px 28px', fontSize: '1rem', borderRadius: 14 }}
                        id="save-profile-btn"
                    >
                        {saving ? (
                            <><div className="spinner" style={{ width: 18, height: 18 }} /> Saving...</>
                        ) : saved ? (
                            <><Check size={18} /> Saved!</>
                        ) : (
                            <>
                                {profileId ? <Save size={18} /> : <Plus size={18} />}
                                {profileId ? 'Update Profile' : 'Create New Profile'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
