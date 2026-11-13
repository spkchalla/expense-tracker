import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Card } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.jsx';
import { paiseToRupees, rupeesToPaise, formatINR } from '../../lib/formatters.js';
import { Check, Info } from 'lucide-react';

export function BudgetSettingsPage({ categories = [] }) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [availableFundsStr, setAvailableFundsStr] = useState('');
  const [flexibleBudgetStr, setFlexibleBudgetStr] = useState('');
  const [categoryLimits, setCategoryLimits] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function loadBudget() {
      try {
        setLoading(true);
        const res = await api.getBudget(selectedMonth);
        if (res && res.success) {
          const b = res.data;
          setAvailableFundsStr(
            b.monthlyAvailableFundsPaise !== null
              ? String(paiseToRupees(b.monthlyAvailableFundsPaise))
              : ''
          );
          setFlexibleBudgetStr(
            b.flexibleBudgetPaise !== null
              ? String(paiseToRupees(b.flexibleBudgetPaise))
              : ''
          );

          const limitsMap = {};
          (b.categoryLimits || []).forEach((cl) => {
            const catId = cl.categoryId?._id || cl.categoryId;
            limitsMap[catId] = String(paiseToRupees(cl.limitPaise));
          });
          setCategoryLimits(limitsMap);
        }
      } catch (err) {
        console.error('Failed to load budget:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBudget();
  }, [selectedMonth]);

  const handleCategoryLimitChange = (catId, val) => {
    setCategoryLimits((prev) => ({
      ...prev,
      [catId]: val,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    const parsedAvailable = availableFundsStr ? parseFloat(availableFundsStr) : null;
    const parsedFlexible = flexibleBudgetStr ? parseFloat(flexibleBudgetStr) : null;

    const formattedCategoryLimits = [];
    Object.entries(categoryLimits).forEach(([catId, val]) => {
      const num = parseFloat(val);
      if (!isNaN(num) && num > 0) {
        formattedCategoryLimits.push({
          categoryId: catId,
          limitPaise: rupeesToPaise(num),
        });
      }
    });

    const payload = {
      monthlyAvailableFundsPaise: parsedAvailable !== null ? rupeesToPaise(parsedAvailable) : null,
      flexibleBudgetPaise: parsedFlexible !== null ? rupeesToPaise(parsedFlexible) : null,
      categoryLimits: formattedCategoryLimits,
    };

    try {
      setSaving(true);
      await api.setBudget(selectedMonth, payload);
      setSuccessMessage('Budget settings updated successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update budget settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading budget configuration..." />;
  }

  return (
    <div className="container">
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h2 className="text-xl" style={{ fontWeight: 700 }}>
          Budget & Limit Settings
        </h2>
        <p className="text-xs text-secondary">
          Configure allowance planning and category limits for {selectedMonth}
        </p>
      </div>

      {successMessage && (
        <div
          style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-success-subtle)',
            border: '1px solid rgba(46, 160, 67, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-success-text)',
            fontSize: 13,
            marginBottom: 'var(--space-4)',
          }}
        >
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <Card title="Monthly Allowance & Flexible Budget">
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--space-3)',
              display: 'flex',
              gap: 'var(--space-2)',
            }}
          >
            <Info size={16} className="text-primary" style={{ marginTop: 2, flexShrink: 0 }} />
            <p className="text-xs text-secondary">
              If you leave Flexible Spending Budget empty, the app will automatically suggest a budget equal to your <strong className="text-primary">Monthly Allowance minus Mandatory Reserves</strong>.
            </p>
          </div>

          <Input
            label="Total Monthly Allowance / Available Funds (INR)"
            type="number"
            step="any"
            min="0"
            prefix="₹"
            placeholder="e.g. 10000"
            value={availableFundsStr}
            onChange={(e) => setAvailableFundsStr(e.target.value)}
            helperText="Your estimated total money for the month (allowance or income)."
          />

          <Input
            label="Flexible Spending Budget Override (INR)"
            type="number"
            step="any"
            min="0"
            prefix="₹"
            placeholder="e.g. 7000 (leave blank to auto-calculate from allowance)"
            value={flexibleBudgetStr}
            onChange={(e) => setFlexibleBudgetStr(e.target.value)}
            helperText="Explicit target for canteen, snacks, grocery and discretionary spend."
          />
        </Card>

        <Card title="Category Spending Limits (Optional)" subtitle="Set spending limits for individual categories">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
            {categories.map((cat) => (
              <Input
                key={cat._id}
                label={cat.name}
                type="number"
                step="any"
                min="0"
                prefix="₹"
                placeholder="No limit"
                value={categoryLimits[cat._id] || ''}
                onChange={(e) => handleCategoryLimitChange(cat._id, e.target.value)}
              />
            ))}
          </div>
        </Card>

        <div>
          <Button type="submit" variant="primary" size="lg" icon={Check} isLoading={saving}>
            Save Budget Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
