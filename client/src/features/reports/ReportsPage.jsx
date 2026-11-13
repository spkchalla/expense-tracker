import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Card } from '../../components/ui/Card.jsx';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.jsx';
import { formatINR, formatMonthName } from '../../lib/formatters.js';
import { TrendingUp, TrendingDown, Minus, Zap, Utensils } from 'lucide-react';

export function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        const res = await api.getReports(selectedMonth);
        if (res && res.success) {
          setReportsData(res.data);
        }
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, [selectedMonth]);

  if (loading && !reportsData) {
    return <LoadingSpinner text="Aggregating monthly insights..." />;
  }

  const { currentMonth, previousMonth, sourceBreakdown = [], mealPeriodBreakdown = [] } =
    reportsData || {};

  const currentTotal = currentMonth?.spending?.totalExpensesPaise || 0;
  const prevTotal = previousMonth?.totalExpensesPaise || 0;
  const diffTotal = currentTotal - prevTotal;

  return (
    <div className="container">
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h2 className="text-xl" style={{ fontWeight: 700 }}>
          Spending Analytics & Comparison
        </h2>
        <p className="text-xs text-secondary">
          Comparing {formatMonthName(currentMonth?.month)} against {formatMonthName(previousMonth?.month)}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* Month-over-Month Comparison Card */}
        <Card title="Month-over-Month Shift">
          <div className="reserve-metrics-grid">
            <div className="metric-box">
              <span className="metric-label">{formatMonthName(previousMonth?.month)}</span>
              <span className="metric-value font-mono">{formatINR(prevTotal)}</span>
            </div>

            <div className="metric-box">
              <span className="metric-label">{formatMonthName(currentMonth?.month)}</span>
              <span className="metric-value font-mono">{formatINR(currentTotal)}</span>
            </div>

            <div className="metric-box">
              <span className="metric-label">Difference</span>
              <div className="flex items-center gap-1">
                {diffTotal > 0 ? (
                  <>
                    <TrendingUp size={16} className="text-danger" />
                    <span className="metric-value font-mono text-danger">+{formatINR(diffTotal)}</span>
                  </>
                ) : diffTotal < 0 ? (
                  <>
                    <TrendingDown size={16} className="text-success" />
                    <span className="metric-value font-mono text-success">-{formatINR(Math.abs(diffTotal))}</span>
                  </>
                ) : (
                  <>
                    <Minus size={16} className="text-secondary" />
                    <span className="metric-value font-mono text-secondary">₹0</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Commerce Platforms */}
        <Card
          title="Quick-Commerce & Delivery Platforms"
          subtitle="Orders from Blinkit, Instamart, Zepto, etc."
        >
          {sourceBreakdown.length === 0 ? (
            <p className="text-xs text-secondary" style={{ textAlign: 'center', padding: 'var(--space-3) 0' }}>
              No platform-attributed orders recorded this month.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {sourceBreakdown.map((s) => (
                <div
                  key={s.source}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-2) var(--space-3)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-primary" />
                    <span className="text-sm font-medium">{s.source}</span>
                    <span className="text-xs text-muted">({s.count} orders)</span>
                  </div>
                  <span className="font-mono text-sm" style={{ fontWeight: 600 }}>
                    {formatINR(s.totalPaise)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Meal Periods */}
        <Card title="Canteen Meal Periods" subtitle="Breakfast, Lunch, Dinner, Late Night distribution">
          {mealPeriodBreakdown.length === 0 ? (
            <p className="text-xs text-secondary" style={{ textAlign: 'center', padding: 'var(--space-3) 0' }}>
              No meal-period tags logged this month.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {mealPeriodBreakdown.map((m) => (
                <div
                  key={m.mealPeriod}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-2) var(--space-3)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Utensils size={14} className="text-primary" />
                    <span className="text-sm font-medium">{m.mealPeriod}</span>
                    <span className="text-xs text-muted">({m.count} meals)</span>
                  </div>
                  <span className="font-mono text-sm" style={{ fontWeight: 600 }}>
                    {formatINR(m.totalPaise)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
