import React from 'react';
import { Card } from '../../components/ui/Card.jsx';
import { formatINR } from '../../lib/formatters.js';
import './Dashboard.css';

export function SpendingTrendChart({ dailyTrends = [] }) {
  if (!dailyTrends || dailyTrends.length === 0) {
    return null;
  }

  // Find max daily amount for scaling
  const maxSpend = Math.max(...dailyTrends.map((d) => d.totalPaise || 0), 10000);

  return (
    <Card
      title="Daily Spending Trend"
      subtitle="Day-by-day flexible vs mandatory expense distribution"
    >
      <div className="trend-chart-container">
        <div className="trend-bars-wrapper">
          {dailyTrends.map((day) => {
            const heightPercent = Math.min(100, Math.max(8, Math.round((day.totalPaise / maxSpend) * 100)));
            const flexPercent = day.totalPaise > 0 ? (day.flexiblePaise / day.totalPaise) * 100 : 100;
            const dayNum = parseInt(day.date.slice(8), 10);

            return (
              <div key={day.date} className="trend-bar-column" title={`${day.date}: ${formatINR(day.totalPaise)}`}>
                <div className="trend-bar-track" style={{ height: `${heightPercent}%` }}>
                  <div
                    className="trend-bar-segment segment-flexible"
                    style={{ height: `${flexPercent}%` }}
                  />
                  <div
                    className="trend-bar-segment segment-need"
                    style={{ height: `${100 - flexPercent}%` }}
                  />
                </div>
                <span className="trend-day-label font-mono">{dayNum}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-4" style={{ marginTop: 'var(--space-3)' }}>
          <div className="flex items-center gap-1 text-xs text-secondary">
            <span className="legend-dot dot-flexible" />
            <span>Flexible</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-secondary">
            <span className="legend-dot dot-need" />
            <span>Need-related</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
