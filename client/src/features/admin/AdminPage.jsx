import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.jsx';
import { formatShortDate, formatFullDateTime } from '../../lib/formatters.js';
import { ShieldAlert, Users, Activity, Lock, Unlock, Search, History } from 'lucide-react';

export function AdminPage({ onOpenAuditLogs }) {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const [ovRes, uRes] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminUsers({ search: search.trim() || undefined }),
      ]);
      if (ovRes && ovRes.success) setOverview(ovRes.data);
      if (uRes && uRes.success) setUsers(uRes.data);
    } catch (err) {
      alert(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const confirmMsg =
      newStatus === 'suspended'
        ? `Are you sure you want to suspend "${user.displayName}"? They will be immediately blocked from signing in.`
        : `Reactivate account for "${user.displayName}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoadingId(user.id);
      await api.updateAdminUserStatus(user.id, newStatus);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTogglePrivilege = async (user, privKey) => {
    const currentPrivs = user.privileges || [];
    const has = currentPrivs.includes(privKey);
    const newPrivs = has ? currentPrivs.filter((p) => p !== privKey) : [...currentPrivs, privKey];

    try {
      setActionLoadingId(`${user.id}-${privKey}`);
      await api.updateAdminUserPrivileges(user.id, newPrivs);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update privileges');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="container">
      {/* Title & Audit Logs Navigation */}
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="flex items-center gap-2">
          <div className="card-icon-need">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h2 className="text-xl" style={{ fontWeight: 700 }}>
              Administration Area
            </h2>
            <p className="text-xs text-secondary">
              Friend privileges & user account management (Privacy Enforced)
            </p>
          </div>
        </div>

        <Button size="sm" variant="secondary" icon={History} onClick={onOpenAuditLogs}>
          Audit Logs
        </Button>
      </div>

      {/* Metrics Banner */}
      {overview && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <Card>
            <span className="text-xs text-secondary">Total Users</span>
            <div className="font-mono text-xl" style={{ fontWeight: 700, marginTop: 2 }}>
              {overview.totalUsers}
            </div>
          </Card>

          <Card>
            <span className="text-xs text-secondary">Active Accounts</span>
            <div className="font-mono text-xl text-success" style={{ fontWeight: 700, marginTop: 2 }}>
              {overview.activeUsers}
            </div>
          </Card>

          <Card>
            <span className="text-xs text-secondary">Suspended</span>
            <div className="font-mono text-xl text-danger" style={{ fontWeight: 700, marginTop: 2 }}>
              {overview.suspendedUsers}
            </div>
          </Card>

          <Card>
            <span className="text-xs text-secondary">System Transactions</span>
            <div className="font-mono text-xl text-primary" style={{ fontWeight: 700, marginTop: 2 }}>
              {overview.totalTransactionCount}
            </div>
          </Card>
        </div>
      )}

      {/* Search Bar */}
      <Card style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)' }}>
        <Input
          placeholder="Search registered users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          prefix={<Search size={14} />}
        />
      </Card>

      {/* User Management List */}
      {loading && users.length === 0 ? (
        <LoadingSpinner text="Loading user management records..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {users.map((u) => (
            <Card key={u.id}>
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2)' }}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base" style={{ fontWeight: 600 }}>
                      {u.displayName}
                    </span>
                    <Badge variant={u.status === 'active' ? 'success' : 'danger'}>
                      {u.status}
                    </Badge>
                    <Badge variant={u.role === 'admin' ? 'need' : 'default'}>
                      {u.role}
                    </Badge>
                    {u.isBootstrapAdmin && <Badge size="sm">Bootstrap Admin</Badge>}
                  </div>
                  <span className="text-xs text-secondary font-mono">{u.email}</span>
                </div>

                {!u.isBootstrapAdmin && (
                  <Button
                    size="sm"
                    variant={u.status === 'active' ? 'danger' : 'secondary'}
                    icon={u.status === 'active' ? Lock : Unlock}
                    isLoading={actionLoadingId === u.id}
                    onClick={() => handleToggleStatus(u)}
                  >
                    {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                  </Button>
                )}
              </div>

              {/* Metadata row: counts ONLY, strict privacy! */}
              <div
                className="flex items-center justify-between text-xs text-muted"
                style={{
                  padding: 'var(--space-2) 0',
                  borderTop: '1px solid var(--border-subtle)',
                  borderBottom: '1px solid var(--border-subtle)',
                  margin: 'var(--space-2) 0',
                }}
              >
                <span>Joined: {formatShortDate(u.createdAt)}</span>
                <span>Last Active: {u.lastActiveAt ? formatShortDate(u.lastActiveAt) : 'Never'}</span>
                <span>Transactions Logged: <strong className="text-primary font-mono">{u.transactionCount}</strong></span>
              </div>

              {/* Feature Privileges Toggles */}
              <div>
                <span className="text-xs text-secondary" style={{ display: 'block', marginBottom: 4 }}>
                  Feature Privileges:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {['advancedAnalytics', 'betaFeatures', 'customDashboard'].map((priv) => {
                    const isGranted = (u.privileges || []).includes(priv);
                    return (
                      <button
                        key={priv}
                        disabled={u.isBootstrapAdmin || actionLoadingId === `${u.id}-${priv}`}
                        className={`chip ${isGranted ? 'chip-active' : ''}`}
                        onClick={() => handleTogglePrivilege(u, priv)}
                        title={isGranted ? 'Click to revoke' : 'Click to grant'}
                      >
                        {priv} {isGranted ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
