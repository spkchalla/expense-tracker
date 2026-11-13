import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../../components/ui/Modal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { api } from '../../lib/api.js';
import { formatINR, formatShortDate } from '../../lib/formatters.js';
import { Trash2, Plus, Info } from 'lucide-react';

export function NeedDetailModal({
  isOpen,
  onClose,
  need,
  onOpenAddContribution,
  onContributionDeleted,
}) {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchContributions = useCallback(async () => {
    if (!need) return;
    try {
      setLoading(true);
      const res = await api.getContributions(need._id);
      if (res && res.success) {
        setContributions(res.data);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [need]);

  useEffect(() => {
    if (isOpen && need) {
      fetchContributions();
    }
  }, [isOpen, need, fetchContributions]);

  if (!need) return null;

  const handleDeleteContribution = async (contribId) => {
    if (!window.confirm('Are you sure you want to remove this contribution record?')) return;
    try {
      await api.deleteContribution(need._id, contribId);
      setContributions((prev) => prev.filter((c) => c._id !== contribId));
      if (onContributionDeleted) onContributionDeleted();
    } catch (err) {
      alert(err.message || 'Failed to delete contribution');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${need.name} Details`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {/* Virtual Tracker Balance Card */}
        <div
          style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
            <span className="text-xs text-secondary">Virtual Fund Tracker Balance</span>
            <span className="text-xs text-muted">(Not a bank account)</span>
          </div>

          <div className="font-mono text-2xl text-need" style={{ fontWeight: 700 }}>
            {formatINR(need.virtualFundBalancePaise || 0)}
          </div>

          <div
            className="flex items-center justify-between text-xs text-muted font-mono"
            style={{ marginTop: varSpace(2), paddingTop: varSpace(2), borderTop: '1px solid var(--border-subtle)' }}
          >
            <span>Opening: {formatINR(need.openingBalancePaise || 0)}</span>
            <span>+ Contribs: {formatINR(need.totalAllTimeContributedPaise || 0)}</span>
            <span>- Spent: {formatINR(need.totalAllTimeSpentPaise || 0)}</span>
          </div>
        </div>

        {need.notes && (
          <p className="text-xs text-secondary" style={{ fontStyle: 'italic' }}>
            Note: {need.notes}
          </p>
        )}

        {/* Contributions History */}
        <div className="flex items-center justify-between" style={{ marginTop: 'var(--space-2)' }}>
          <h4 className="text-sm" style={{ fontWeight: 600 }}>
            Contribution Records
          </h4>
          <Button
            size="sm"
            variant="secondary"
            icon={Plus}
            onClick={() => {
              onClose();
              onOpenAddContribution(need);
            }}
          >
            Add
          </Button>
        </div>

        {loading ? (
          <p className="text-xs text-secondary">Loading records...</p>
        ) : contributions.length === 0 ? (
          <p className="text-xs text-secondary" style={{ padding: 'var(--space-3) 0', textAlign: 'center' }}>
            No contributions recorded yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {contributions.map((c) => (
              <div
                key={c._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'var(--bg-input)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-success" style={{ fontWeight: 600 }}>
                      +{formatINR(c.amountPaise)}
                    </span>
                    <span className="text-xs text-muted">{formatShortDate(c.contributedAt)}</span>
                  </div>
                  {c.note && <span className="text-xs text-secondary">{c.note}</span>}
                </div>

                <button
                  onClick={() => handleDeleteContribution(c._id)}
                  style={{ color: 'var(--text-muted)', padding: 4 }}
                  title="Delete record"
                  aria-label="Delete contribution"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 'var(--space-3)' }}>
          <Button variant="secondary" fullWidth onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function varSpace(num) {
  return `var(--space-${num})`;
}
