import React from 'react';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { formatINR } from '../../lib/formatters.js';
import './Dashboard.css';

export function CategoryBreakdown({ breakdown = [], onSelectCategory }) {
  if (!breakdown || breakdown.length === 0) {
    return (
      <Card title="Category Breakdown">
        <p className="text-sm text-secondary" style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
          No spending recorded for this month.
        </p>
      </Card>
    );
  }

  return (
    <Card title="Spending by Category" subtitle="Ranked spending and category budget progress">
      <div className="category-breakdown-list">
        {breakdown.map((item) => {
          const hasLimit = item.limitPaise !== null && item.limitPaise > 0;
          const isOverLimit = hasLimit && item.remainingPaise < 0;

          return (
            <div
              key={item.categoryId}
              className="category-breakdown-row"
              onClick={() => onSelectCategory && onSelectCategory(item.categoryId)}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                <div className="flex items-center gap-2">
                  <span className="category-row-name">{item.categoryName}</span>
                  <Badge size="sm" variant={item.countsTowardFlexibleBudget ? 'flexible' : 'default'}>
                    {item.countsTowardFlexibleBudget ? 'Flexible' : 'Need / Fixed'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm" style={{ fontWeight: 600 }}>
                    {formatINR(item.amountPaise)}
                  </span>
                  <span className="text-xs text-muted font-mono" style={{ width: 34, textAlign: 'right' }}>
                    {item.percentageOfTotal}%
                  </span>
                </div>
              </div>

              {/* Progress bar representing category proportion or limit */}
              <div className="category-bar-track">
                <div
                  className={`category-bar-fill ${
                    isOverLimit
                      ? 'fill-danger'
                      : item.countsTowardFlexibleBudget
                      ? 'fill-flexible'
                      : 'fill-need'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(3, item.percentageOfTotal))}%` }}
                />
              </div>

              {hasLimit && (
                <div className="flex items-center justify-between text-xs" style={{ marginTop: 2 }}>
                  <span className="text-muted">Limit: {formatINR(item.limitPaise)}</span>
                  <span className={isOverLimit ? 'text-danger font-mono' : 'text-success font-mono'}>
                    {isOverLimit
                      ? `Exceeded by ${formatINR(Math.abs(item.remainingPaise))}`
                      : `${formatINR(item.remainingPaise)} left`}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
