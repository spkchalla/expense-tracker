import React from 'react';
import { Card } from '../../components/ui/Card.jsx';
import { ProgressBar } from '../../components/ui/ProgressBar.jsx';
import { formatINR } from '../../lib/formatters.js';
import { Utensils, Settings } from 'lucide-react';
import './Dashboard.css';

export function FlexibleBudgetCard({ spending, budget, onOpenBudgetSettings }) {
  const { flexibleExpensesPaise = 0, totalExpensesPaise = 0, needExpensesPaise = 0 } = spending || {};
  const {
    flexibleBudgetPaise,
    flexibleBudgetRemainingPaise,
    flexibleBudgetProgressPercent = 0,
    isBudgetSuggested = false,
  } = budget || {};

  const hasBudget = flexibleBudgetPaise !== null && flexibleBudgetPaise > 0;
  const isOverBudget = hasBudget && flexibleBudgetRemainingPaise < 0;

  const barColor = isOverBudget ? 'danger' : flexibleBudgetProgressPercent > 80 ? 'warning' : 'primary';

  return (
    <Card className="flexible-card">
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
        <div className="flex items-center gap-2">
          <div className="card-icon-flexible">
            <Utensils size={18} />
          </div>
          <div>
            <h4 className="text-base" style={{ fontWeight: 600 }}>
              Flexible Spending
            </h4>
            <p className="text-xs text-secondary">
              Daily university food, snacks & quick commerce
            </p>
          </div>
        </div>

        <button
          className="text-xs text-secondary flex items-center gap-1"
          onClick={onOpenBudgetSettings}
          title="Configure Budget"
        >
          <Settings size={14} />
          <span className="desktop-only">Budget</span>
        </button>
      </div>

      <div className="reserve-metrics-grid">
        <div className="metric-box">
          <span className="metric-label">Flexible Spent</span>
          <span className="metric-value font-mono text-flexible">
            {formatINR(flexibleExpensesPaise)}
          </span>
        </div>

        <div className="metric-box">
          <span className="metric-label">
            {hasBudget ? (isBudgetSuggested ? 'Suggested Budget' : 'Flexible Budget') : 'Flexible Budget'}
          </span>
          <span className="metric-value font-mono">
            {hasBudget ? formatINR(flexibleBudgetPaise) : 'Not set'}
          </span>
        </div>

        <div className="metric-box">
          <span className="metric-label">Remaining</span>
          <span
            className={`metric-value font-mono ${
              hasBudget
                ? isOverBudget
                  ? 'text-danger'
                  : 'text-success'
                : 'text-secondary'
            }`}
          >
            {hasBudget
              ? isOverBudget
                ? `-${formatINR(Math.abs(flexibleBudgetRemainingPaise))}`
                : formatINR(flexibleBudgetRemainingPaise)
              : '—'}
          </span>
        </div>
      </div>

      {hasBudget && (
        <div style={{ marginTop: 'var(--space-3)' }}>
          <div className="flex items-center justify-between text-xs" style={{ marginBottom: 4 }}>
            <span className="text-secondary">
              {isOverBudget ? 'Budget Exceeded!' : 'Budget Used'}
            </span>
            <span className={`font-mono text-${barColor}`}>{flexibleBudgetProgressPercent}%</span>
          </div>
          <ProgressBar value={flexibleExpensesPaise} max={flexibleBudgetPaise} color={barColor} />
        </div>
      )}

      {/* Spend Partition Summary */}
      <div className="spend-split-row">
        <span className="text-xs text-secondary">
          Total Spent this month: <strong className="text-primary font-mono">{formatINR(totalExpensesPaise)}</strong>
        </span>
        <span className="text-xs text-muted">
          (Needs: {formatINR(needExpensesPaise)} | Flexible: {formatINR(flexibleExpensesPaise)})
        </span>
      </div>
    </Card>
  );
}
