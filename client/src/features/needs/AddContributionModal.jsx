import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { api } from '../../lib/api.js';
import { rupeesToPaise, formatINR } from '../../lib/formatters.js';
import { ShieldCheck, Info } from 'lucide-react';

export function AddContributionModal({
  isOpen,
  onClose,
  need,
  onSuccess,
}) {
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!need) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedRupees = parseFloat(amountStr);
    if (isNaN(parsedRupees) || parsedRupees <= 0) {
      setError('Please enter a valid contribution amount greater than 0');
      return;
    }

    try {
      setLoading(true);
      const res = await api.addContribution(need._id, {
        amountPaise: rupeesToPaise(parsedRupees),
        note: note.trim(),
      });
      if (res && res.success) {
        setAmountStr('');
        setNote('');
        onClose();
        if (onSuccess) onSuccess(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to record contribution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Set Aside Money for ${need.name}`}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="error-banner" style={{ marginBottom: 'var(--space-3)' }}>
            {error}
          </div>
        )}

        <div
          style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-need-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(137, 87, 229, 0.2)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            gap: 'var(--space-2)',
            alignItems: 'flex-start',
          }}
        >
          <Info size={16} className="text-need" style={{ marginTop: 2, flexShrink: 0 }} />
          <div className="text-xs text-secondary">
            <strong className="text-need">Virtual Reserve Allocation:</strong> This records that you have set aside money into your virtual reserve fund. It is <strong className="text-primary">not counted as an expense</strong> and will not inflate your spending totals.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-3)',
            padding: 'var(--space-2) var(--space-3)',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <span className="text-xs text-secondary">Remaining to reserve this month:</span>
          <span className="font-mono text-sm text-need" style={{ fontWeight: 600 }}>
            {formatINR(need.remainingThisMonthPaise || 0)}
          </span>
        </div>

        <Input
          label="Amount to Set Aside (INR)"
          type="number"
          step="any"
          min="1"
          placeholder="0"
          prefix="₹"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          autoFocus
          required
        />

        <Input
          label="Note (Optional)"
          placeholder="e.g. Set aside from pocket money / allowance"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            icon={ShieldCheck}
            style={{ flex: 2 }}
          >
            Record Allocation
          </Button>
        </div>
      </form>
    </Modal>
  );
}
