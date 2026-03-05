import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/clerk-react';
import { useTheme } from 'next-themes';
import {
    LayoutDashboard, FileText, Plus, Building2,
    LogOut, Zap, Menu, X, Sun, Moon
} from 'lucide-react';

const NAV_ITEMS = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/invoices', icon: FileText, label: 'Invoices' },
    { to: '/create', icon: Plus, label: 'New Invoice' },
    { to: '/profile', icon: Building2, label: 'Business' },
];

export default function Layout({ children }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { signOut } = useClerk();
    const { user } = useUser();
    const navigate = useNavigate();
    const { theme, setTheme, systemTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true) }, []);

    const handleSignOut = () => signOut(() => navigate('/'));

    const toggleTheme = () => {
        const current = theme === 'system' ? systemTheme : theme;
        setTheme(current === 'dark' ? 'light' : 'dark');
    };

    const currentTheme = mounted ? (theme === 'system' ? systemTheme : theme) : 'light';

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                        zIndex: 49, backdropFilter: 'blur(2px)'
                    }}
                />
            )}

            {/* Sidebar - Pure CSS Hover Expansion */}
            <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>

                {/* Logo */}
                <Link to="/" className="sidebar-logo-container" style={{ textDecoration: 'none' }}>
                    <div className="sidebar-logo-icon">
                        <Zap size={18} color="white" />
                    </div>
                    <span className="sidebar-logo-text">
                        InvoiceFlow
                    </span>
                </Link>

                {/* Nav items */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', flex: 1, padding: '0 12px' }}>
                    {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
                            title={label}
                        >
                            <div className="sidebar-item-icon">
                                <Icon size={20} />
                            </div>
                            <span className="sidebar-text">{label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Utilities & User */}
                <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 16 }}>

                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className="sidebar-item"
                        style={{ border: 'none', background: 'transparent', margin: '0 12px', width: 'auto' }}
                        title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
                    >
                        <div className="sidebar-item-icon">
                            {currentTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </div>
                        <span className="sidebar-text">{currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>

                    {/* User profile */}
                    <div className="sidebar-user-container">
                        <img
                            src={user?.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName}`}
                            alt="avatar"
                            className="sidebar-avatar"
                        />
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">
                                {user?.firstName || 'User'}
                            </div>
                            <div className="sidebar-user-email">
                                {user?.primaryEmailAddress?.emailAddress}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="sidebar-item"
                        style={{ color: '#ef4444', border: 'none', background: 'transparent', margin: '0 12px', width: 'auto' }}
                    >
                        <div className="sidebar-item-icon">
                            <LogOut size={18} />
                        </div>
                        <span className="sidebar-text">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile menu button */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{
                    position: 'fixed', top: 16, left: 16, zIndex: 60,
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 10, padding: 8, cursor: 'pointer', color: 'var(--text-primary)',
                    display: 'none'
                }}
                className="mobile-menu-btn no-print"
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Main content */}
            <main className="main-content" style={{ flex: 1, padding: '0' }}>
                {children}
            </main>

        </div>
    );
}
