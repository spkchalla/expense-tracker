import React from 'react';
import { useAuth } from '../../features/auth/AuthContext.jsx';
import { Wallet, ShieldAlert, WifiOff, RefreshCw, User as UserIcon } from 'lucide-react';
import './Layout.css';

export function Navbar({ onNavigate, currentTab, offlineSync }) {
  const { user, isAdmin } = useAuth();
  const { isOnline, pendingCount, isSyncing, syncPending } = offlineSync;

  return (
    <header className="navbar">
      <div className="container flex items-center justify-between" style={{ height: '100%' }}>
        <div
          className="flex items-center gap-2"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('dashboard')}
        >
          <div className="navbar-logo">
            <Wallet size={18} />
          </div>
          <span className="navbar-title">Pocket Ledger</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Offline / Sync Status */}
          {!isOnline ? (
            <div className="badge badge-warning flex items-center gap-1" title="Offline mode">
              <WifiOff size={12} />
              <span className="text-xs">Offline</span>
            </div>
          ) : pendingCount > 0 ? (
            <button
              className="sync-badge"
              onClick={syncPending}
              disabled={isSyncing}
              title={`${pendingCount} pending offline items. Click to sync.`}
            >
              <RefreshCw size={12} className={isSyncing ? 'btn-spinner' : ''} />
              <span>{pendingCount} to sync</span>
            </button>
          ) : null}

          {/* Admin badge / link */}
          {isAdmin && (
            <button
              className={`navbar-tab-btn ${currentTab === 'admin' ? 'active' : ''}`}
              onClick={() => onNavigate('admin')}
              title="Admin Panel"
            >
              <ShieldAlert size={16} />
              <span className="desktop-only text-xs">Admin</span>
            </button>
          )}

          {/* Profile link */}
          <button
            className={`navbar-profile-btn ${currentTab === 'profile' ? 'active' : ''}`}
            onClick={() => onNavigate('profile')}
            title={`Signed in as ${user?.displayName}`}
          >
            <UserIcon size={16} />
            <span className="desktop-only text-xs">{user?.displayName?.split(' ')[0]}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
