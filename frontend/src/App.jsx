import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, SignIn, SignUp } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import { setupApiAuth } from './lib/api';
import { ThemeProvider, useTheme } from 'next-themes';
import { dark } from '@clerk/themes';

import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import InvoicesPage from './pages/InvoicesPage';
import CreateInvoicePage from './pages/CreateInvoicePage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import BusinessProfilePage from './pages/BusinessProfilePage';

function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading...</p>
        </div>
      </div>
    );
  }
  if (!isSignedIn) return <Navigate to="/" replace />;
  return children;
}

function AuthPage({ type }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: 20
    }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        {type === 'signin' ? (
          <SignIn routing="path" path="/sign-in" appearance={{ baseTheme: isDark ? dark : undefined }} />
        ) : (
          <SignUp routing="path" path="/sign-up" appearance={{ baseTheme: isDark ? dark : undefined }} />
        )}
      </div>
      {/* Decorative orbs */}
      <div style={{ position: 'fixed', width: 400, height: 400, background: 'rgba(59,130,246,0.1)', borderRadius: '50%', filter: 'blur(80px)', top: -100, left: -100, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', width: 300, height: 300, background: 'rgba(16,185,129,0.06)', borderRadius: '50%', filter: 'blur(80px)', bottom: -50, right: -50, pointerEvents: 'none' }} />
    </div>
  );
}

export default function App() {
  const { getToken } = useAuth();

  useEffect(() => {
    setupApiAuth(getToken);
  }, [getToken]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            fontSize: '0.875rem',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          },
          success: { iconTheme: { primary: '#10B981', secondary: 'var(--bg-elevated)' } },
          error: { iconTheme: { primary: '#EF4444', secondary: 'var(--bg-elevated)' } },
        }}
      />

      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/sign-in/*" element={<AuthPage type="signin" />} />
        <Route path="/sign-up/*" element={<AuthPage type="signup" />} />

        {/* Protected */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout><DashboardPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/invoices" element={
          <ProtectedRoute>
            <Layout><InvoicesPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/invoices/:id" element={
          <ProtectedRoute>
            <Layout><InvoiceDetailPage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/create" element={
          <ProtectedRoute>
            <Layout><CreateInvoicePage /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout><BusinessProfilePage /></Layout>
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}
