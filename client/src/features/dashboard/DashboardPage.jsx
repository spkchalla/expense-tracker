import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api.js';
import { ReservesCard } from './ReservesCard.jsx';
import { FlexibleBudgetCard } from './FlexibleBudgetCard.jsx';
import { CategoryBreakdown } from './CategoryBreakdown.jsx';
import { RecentTransactions } from './RecentTransactions.jsx';
import { SpendingTrendChart } from './SpendingTrendChart.jsx';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.jsx';
import { formatMonthName } from '../../lib/formatters.js';
import { ChevronLeft, ChevronRight, RotateCcw, AlertTriangle } from 'lucide-react';
import './Dashboard.css';

export function DashboardPage({
  onNavigate,
  onOpenQuickAdd,
  onSelectCategory,
  onSelectTransaction,
  lastAddedTransaction,
  onUndoLastTransaction,
}) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboard(selectedMonth);
      if (res && res.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Month navigation
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    let newM = m - 1;
    let newY = y;
    if (newM < 1) {
      newM = 12;
      newY -= 1;
    }
    setSelectedMonth(`${newY}-${String(newM).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    let newM = m + 1;
    let newY = y;
    if (newM > 12) {
      newM = 1;
      newY += 1;
    }
    setSelectedMonth(`${newY}-${String(newM).padStart(2, '0')}`);
  };

  return (
    <div className="container">
      {/* Month Selector Bar */}
      <div className="dashboard-header">
        <div className="month-picker-controls">
          <button className="month-btn" onClick={handlePrevMonth} aria-label="Previous month">
            <ChevronLeft size={18} />
          </button>
          <span className="month-title">{formatMonthName(selectedMonth)}</span>
          <button className="month-btn" onClick={handleNextMonth} aria-label="Next month">
            <ChevronRight size={18} />
          </button>
        </div>

        <button
          className="month-btn"
          onClick={fetchDashboard}
          title="Reload data"
          aria-label="Reload dashboard"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Undo Toast Banner */}
      {lastAddedTransaction && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-2) var(--space-4)',
            backgroundColor: 'var(--color-primary-subtle)',
            border: '1px solid var(--border-focus)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <span className="text-xs">
            Expense recorded: <strong>₹{(lastAddedTransaction.amountPaise / 100).toFixed(0)}</strong>
          </span>
          <button
            onClick={onUndoLastTransaction}
            className="text-xs text-primary font-mono"
            style={{ fontWeight: 600, textDecoration: 'underline' }}
          >
            Undo
          </button>
        </div>
      )}

      {loading && !dashboardData ? (
        <LoadingSpinner text="Calculating dashboard balances..." />
      ) : error ? (
        <div
          style={{
            padding: 'var(--space-6)',
            textAlign: 'center',
            color: 'var(--color-danger-text)',
          }}
        >
          <AlertTriangle size={32} style={{ margin: '0 auto var(--space-2)' }} />
          <p className="text-base">{error}</p>
          <button
            onClick={fetchDashboard}
            className="btn btn-secondary btn-sm"
            style={{ marginTop: 'var(--space-3)' }}
          >
            Try Again
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Top Priority Cards: Mandatory Reserves & Flexible Budget */}
          <ReservesCard
            reserves={dashboardData?.reserves}
            onOpenNeeds={() => onNavigate('needs')}
          />

          <FlexibleBudgetCard
            spending={dashboardData?.spending}
            budget={dashboardData?.budget}
            onOpenBudgetSettings={() => onNavigate('budgets')}
          />

          {/* Daily Trend Chart */}
          <SpendingTrendChart dailyTrends={dashboardData?.dailyTrends} />

          {/* Category Breakdown */}
          <CategoryBreakdown
            breakdown={dashboardData?.categoryBreakdown}
            onSelectCategory={onSelectCategory}
          />

          {/* Recent Transactions */}
          <RecentTransactions
            transactions={dashboardData?.recentTransactions}
            onOpenHistory={() => onNavigate('transactions')}
            onSelectTransaction={onSelectTransaction}
          />
        </div>
      )}
    </div>
  );
}
