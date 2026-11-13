import React from 'react';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { formatINR, formatShortDate } from '../../lib/formatters.js';
import { ArrowRight, ShoppingBag, Coffee, Utensils, Zap } from 'lucide-react';
import './Dashboard.css';

export function RecentTransactions({ transactions = [], onOpenHistory, onSelectTransaction }) {
  if (!transactions || transactions.length === 0) {
    return (
      <Card title="Recent Transactions">
        <p className="text-sm text-secondary" style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
          No transactions recorded yet this month.
        </p>
      </Card>
    );
  }

  const getSourceBadge = (source) => {
    if (!source) return null;
    return <span className="source-tag">{source}</span>;
  };

  return (
    <Card
      title="Recent Expenses"
      action={
        <button className="text-xs text-primary flex items-center gap-1" onClick={onOpenHistory}>
          <span>View all</span>
          <ArrowRight size={12} />
        </button>
      }
    >
      <div className="recent-tx-list">
        {transactions.map((tx) => (
          <div
            key={tx._id}
            className="recent-tx-item"
            onClick={() => onSelectTransaction && onSelectTransaction(tx)}
          >
            <div className="flex items-center gap-3">
              <div className="recent-tx-icon">
                {tx.source ? (
                  <Zap size={16} />
                ) : tx.mealPeriod ? (
                  <Utensils size={16} />
                ) : (
                  <ShoppingBag size={16} />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="recent-tx-title">
                    {tx.merchant || tx.description || tx.categoryId?.name || 'Expense'}
                  </span>
                  {getSourceBadge(tx.source)}
                  {tx.mealPeriod && <span className="meal-tag">{tx.mealPeriod}</span>}
                </div>

                <div className="flex items-center gap-2" style={{ marginTop: 2 }}>
                  <span className="text-xs text-muted">
                    {formatShortDate(tx.occurredAt)} • {tx.categoryId?.name}
                  </span>
                  {tx.needId && (
                    <Badge size="sm" variant="need">
                      {tx.needId?.name || 'Need'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="recent-tx-amount-col">
              <span className="font-mono text-sm" style={{ fontWeight: 600 }}>
                {formatINR(tx.amountPaise)}
              </span>
              <span className="text-xs text-muted">{tx.paymentMethod || 'UPI'}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
