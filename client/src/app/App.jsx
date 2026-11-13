import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from '../features/auth/AuthContext.jsx';
import { LoginPage } from '../features/auth/LoginPage.jsx';
import { RegisterPage } from '../features/auth/RegisterPage.jsx';
import { Layout } from '../components/layout/Layout.jsx';
import { DashboardPage } from '../features/dashboard/DashboardPage.jsx';
import { NeedsPage } from '../features/needs/NeedsPage.jsx';
import { TransactionListPage } from '../features/transactions/TransactionListPage.jsx';
import { QuickAddModal } from '../features/transactions/QuickAddModal.jsx';
import { BudgetSettingsPage } from '../features/budgets/BudgetSettingsPage.jsx';
import { ReportsPage } from '../features/reports/ReportsPage.jsx';
import { ProfilePage } from '../features/profile/ProfilePage.jsx';
import { AdminPage } from '../features/admin/AdminPage.jsx';
import { AdminAuditPage } from '../features/admin/AdminAuditPage.jsx';
import { LoadingSpinner } from '../components/ui/LoadingSpinner.jsx';
import { useOfflineSync } from '../hooks/useOfflineSync.js';
import { api } from '../lib/api.js';
import '../styles/global.css';

function MainApp() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Categories & Needs shared state
  const [categories, setCategories] = useState([]);
  const [needs, setNeeds] = useState([]);

  // Undo transaction state
  const [lastAddedTransaction, setLastAddedTransaction] = useState(null);

  // PWA Install prompt
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const offlineSync = useOfflineSync(user);

  const loadReferenceData = useCallback(async () => {
    if (!user) return;
    try {
      const [catRes, needRes] = await Promise.all([
        api.getCategories(false),
        api.getNeeds('', false),
      ]);
      if (catRes && catRes.success) setCategories(catRes.data);
      if (needRes && needRes.success) setNeeds(needRes.data);
    } catch {
      // Ignore reference data loading errors when offline
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadReferenceData();
    }
  }, [user, loadReferenceData]);

  const handleQuickAddSuccess = (newTx) => {
    setLastAddedTransaction(newTx);
    loadReferenceData();
    // Auto-clear undo toast after 8 seconds
    setTimeout(() => {
      setLastAddedTransaction(null);
    }, 8000);
  };

  const handleUndoLastTransaction = async () => {
    if (!lastAddedTransaction) return;
    try {
      if (!lastAddedTransaction.isOffline && lastAddedTransaction._id) {
        await api.deleteTransaction(lastAddedTransaction._id);
      }
      setLastAddedTransaction(null);
      loadReferenceData();
    } catch (err) {
      alert(err.message || 'Failed to undo transaction');
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Starting Pocket Ledger..." size="lg" />
      </div>
    );
  }

  if (!user) {
    return authView === 'login' ? (
      <LoginPage onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  return (
    <Layout
      currentTab={currentTab}
      onNavigate={setCurrentTab}
      onOpenQuickAdd={() => setIsQuickAddOpen(true)}
      offlineSync={offlineSync}
    >
      {currentTab === 'dashboard' && (
        <DashboardPage
          onNavigate={setCurrentTab}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          lastAddedTransaction={lastAddedTransaction}
          onUndoLastTransaction={handleUndoLastTransaction}
        />
      )}

      {currentTab === 'needs' && <NeedsPage categories={categories} />}

      {currentTab === 'transactions' && (
        <TransactionListPage
          categories={categories}
          needs={needs}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        />
      )}

      {currentTab === 'budgets' && <BudgetSettingsPage categories={categories} />}

      {currentTab === 'reports' && <ReportsPage />}

      {currentTab === 'profile' && (
        <ProfilePage
          deferredPrompt={deferredPrompt}
          onInstallApp={handleInstallApp}
        />
      )}

      {currentTab === 'admin' && isAdmin && (
        <AdminPage onOpenAuditLogs={() => setCurrentTab('admin-audit')} />
      )}

      {currentTab === 'admin-audit' && isAdmin && (
        <AdminAuditPage onBack={() => setCurrentTab('admin')} />
      )}

      {/* Global Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        categories={categories}
        needs={needs}
        offlineSync={offlineSync}
        onSuccess={handleQuickAddSuccess}
      />
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
