import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { ProgressBar } from '../../components/ui/ProgressBar.jsx';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { AddNeedModal } from './AddNeedModal.jsx';
import { AddContributionModal } from './AddContributionModal.jsx';
import { NeedDetailModal } from './NeedDetailModal.jsx';
import { formatINR } from '../../lib/formatters.js';
import {
  ShieldCheck,
  Plus,
  MoreVertical,
  Pause,
  Play,
  Archive,
  Edit2,
  List,
} from 'lucide-react';
import './Needs.css';

export function NeedsPage({ categories = [] }) {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Modals state
  const [isAddNeedOpen, setIsAddNeedOpen] = useState(false);
  const [editingNeed, setEditingNeed] = useState(null);
  const [contributingNeed, setContributingNeed] = useState(null);
  const [detailNeed, setDetailNeed] = useState(null);
  const [activeMenuNeedId, setActiveMenuNeedId] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const fetchNeeds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getNeeds(selectedMonth, showArchived);
      if (res && res.success) {
        setNeeds(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load needs');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, showArchived]);

  useEffect(() => {
    fetchNeeds();
  }, [fetchNeeds]);

  // Aggregate monthly totals for active needs
  const activeNeeds = needs.filter((n) => n.isActive && !n.isArchived);
  const pausedOrArchivedNeeds = needs.filter((n) => !n.isActive || n.isArchived);

  const totalMonthlyTarget = activeNeeds.reduce(
    (sum, n) => sum + (n.monthlyReserveAmountPaise || 0),
    0
  );
  const totalContributed = activeNeeds.reduce(
    (sum, n) => sum + (n.contributedThisMonthPaise || 0),
    0
  );
  const totalRemaining = Math.max(0, totalMonthlyTarget - totalContributed);
  const overallProgress =
    totalMonthlyTarget > 0
      ? Math.min(100, Math.round((totalContributed / totalMonthlyTarget) * 100))
      : 100;

  const handleToggleActive = async (need) => {
    try {
      await api.updateNeed(need._id, { isActive: !need.isActive });
      fetchNeeds();
    } catch (err) {
      alert(err.message || 'Failed to update need');
    }
  };

  const handleArchive = async (need) => {
    if (!window.confirm(`Archive "${need.name}"? Historical contributions and expenses will be preserved.`)) {
      return;
    }
    try {
      await api.archiveNeed(need._id);
      fetchNeeds();
    } catch (err) {
      alert(err.message || 'Failed to archive need');
    }
  };

  return (
    <div className="container">
      {/* Header & New Need Action */}
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <h2 className="text-xl" style={{ fontWeight: 700 }}>
            Mandatory Reserves
          </h2>
          <p className="text-xs text-secondary">
            Set aside money for unavoidable needs (laundry, haircut, transport, toiletries)
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => {
            setEditingNeed(null);
            setIsAddNeedOpen(true);
          }}
        >
          New Need
        </Button>
      </div>

      {/* Reserves Summary Card */}
      <Card className="reserves-summary-banner" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="reserve-metrics-grid">
          <div className="metric-box">
            <span className="metric-label">Monthly Target</span>
            <span className="metric-value font-mono">{formatINR(totalMonthlyTarget)}</span>
          </div>
          <div className="metric-box">
            <span className="metric-label">Funded This Month</span>
            <span className="metric-value font-mono text-success">
              {formatINR(totalContributed)}
            </span>
          </div>
          <div className="metric-box">
            <span className="metric-label">Remaining to Reserve</span>
            <span
              className={`metric-value font-mono ${totalRemaining > 0 ? 'text-need' : 'text-success'}`}
            >
              {formatINR(totalRemaining)}
            </span>
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-3)' }}>
          <div className="flex items-center justify-between text-xs" style={{ marginBottom: 4 }}>
            <span className="text-secondary">Overall Reserve Target Funded</span>
            <span className="font-mono text-need">{overallProgress}%</span>
          </div>
          <ProgressBar value={totalContributed} max={totalMonthlyTarget} color="need" />
        </div>
      </Card>

      {/* Needs List */}
      {loading && needs.length === 0 ? (
        <LoadingSpinner text="Loading needs and reserve balances..." />
      ) : activeNeeds.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No Active Needs Yet"
          description="Create your first reserve obligation (e.g. Laundry, Grooming, Transport, Phone) so you know how much money to set aside each month."
          actionText="Create a Need"
          onAction={() => {
            setEditingNeed(null);
            setIsAddNeedOpen(true);
          }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {activeNeeds.map((need) => (
            <Card key={need._id} className="need-item-card">
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2)' }}>
                <div className="flex items-center gap-2">
                  <h3 className="text-base" style={{ fontWeight: 600 }}>
                    {need.name}
                  </h3>
                  {need.categoryId && (
                    <Badge size="sm">{need.categoryId?.name || 'Category'}</Badge>
                  )}
                  {need.frequency && (
                    <span className="text-xs text-muted">({need.frequency})</span>
                  )}
                </div>

                <div className="relative">
                  <button
                    className="menu-btn"
                    onClick={() =>
                      setActiveMenuNeedId(activeMenuNeedId === need._id ? null : need._id)
                    }
                    aria-label="Options"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {activeMenuNeedId === need._id && (
                    <div className="dropdown-menu">
                      <button
                        onClick={() => {
                          setActiveMenuNeedId(null);
                          setDetailNeed(need);
                        }}
                      >
                        <List size={14} /> History & Balances
                      </button>
                      <button
                        onClick={() => {
                          setActiveMenuNeedId(null);
                          setEditingNeed(need);
                          setIsAddNeedOpen(true);
                        }}
                      >
                        <Edit2 size={14} /> Edit Target
                      </button>
                      <button
                        onClick={() => {
                          setActiveMenuNeedId(null);
                          handleToggleActive(need);
                        }}
                      >
                        <Pause size={14} /> Pause Need
                      </button>
                      <button
                        className="text-danger"
                        onClick={() => {
                          setActiveMenuNeedId(null);
                          handleArchive(need);
                        }}
                      >
                        <Archive size={14} /> Archive
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Monthly target vs contributed */}
              <div
                className="flex items-center justify-between text-xs"
                style={{ marginBottom: 'var(--space-2)' }}
              >
                <span className="text-secondary">
                  Target: <strong className="text-primary font-mono">{formatINR(need.monthlyReserveAmountPaise)}</strong> / mo
                </span>
                <span className="text-secondary font-mono">
                  Contributed: <strong className="text-success">{formatINR(need.contributedThisMonthPaise)}</strong> ({need.progressPercent}%)
                </span>
              </div>

              <ProgressBar
                value={need.contributedThisMonthPaise}
                max={need.monthlyReserveAmountPaise}
                color={need.progressPercent >= 100 ? 'success' : 'need'}
              />

              {/* Fund balance & Quick contribution button */}
              <div
                className="flex items-center justify-between"
                style={{
                  marginTop: 'var(--space-3)',
                  paddingTop: 'var(--space-2)',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <span className="text-xs text-muted" style={{ display: 'block' }}>
                    Virtual Tracker Balance:
                  </span>
                  <span className="font-mono text-sm text-need" style={{ fontWeight: 600 }}>
                    {formatINR(need.virtualFundBalancePaise)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDetailNeed(need)}
                  >
                    Details
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setContributingNeed(need)}
                  >
                    + Set Aside
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Paused / Archived Section */}
      {pausedOrArchivedNeeds.length > 0 && (
        <div style={{ marginTop: 'var(--space-6)' }}>
          <button
            className="flex items-center gap-1 text-xs text-secondary"
            onClick={() => setShowArchived(!showArchived)}
          >
            <span>
              {showArchived
                ? `Hide Paused / Archived (${pausedOrArchivedNeeds.length})`
                : `Show Paused / Archived (${pausedOrArchivedNeeds.length})`}
            </span>
          </button>

          {showArchived && (
            <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {pausedOrArchivedNeeds.map((need) => (
                <div
                  key={need._id}
                  style={{
                    padding: 'var(--space-3)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    opacity: 0.8,
                  }}
                  className="flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{need.name}</span>
                      <Badge size="sm">{need.isArchived ? 'Archived' : 'Paused'}</Badge>
                    </div>
                    <span className="text-xs text-muted font-mono">
                      Target: {formatINR(need.monthlyReserveAmountPaise)} | Tracker Balance: {formatINR(need.virtualFundBalancePaise)}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Play}
                    onClick={() => handleToggleActive(need)}
                  >
                    Resume
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AddNeedModal
        isOpen={isAddNeedOpen}
        onClose={() => {
          setIsAddNeedOpen(false);
          setEditingNeed(null);
        }}
        categories={categories}
        editingNeed={editingNeed}
        onSuccess={fetchNeeds}
      />

      <AddContributionModal
        isOpen={Boolean(contributingNeed)}
        onClose={() => setContributingNeed(null)}
        need={contributingNeed}
        onSuccess={fetchNeeds}
      />

      <NeedDetailModal
        isOpen={Boolean(detailNeed)}
        onClose={() => setDetailNeed(null)}
        need={detailNeed}
        onOpenAddContribution={(need) => setContributingNeed(need)}
        onContributionDeleted={fetchNeeds}
      />
    </div>
  );
}
