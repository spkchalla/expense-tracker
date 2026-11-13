import React from 'react';
import { Card } from '../../components/ui/Card.jsx';
import { ProgressBar } from '../../components/ui/ProgressBar.jsx';
import { formatINR } from '../../lib/formatters.js';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import './Dashboard.css';

export function ReservesCard({ reserves, onOpenNeeds }) {
  const {
    monthlyReserveTargetPaise = 0,
    contributedThisMonthPaise = 0,
    remainingToReservePaise = 0,
    progressPercent = 0,
    needs = [],
  } = reserves || {};

  return (
    <Card className="reserves-card">
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
        <div className="flex items-center gap-2">
          <div className="card-icon-need">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h4 className="text-base" style={{ fontWeight: 600 }}>
              Mandatory Reserves
            </h4>
            <p className="text-xs text-secondary">Unavoidable needs reserve planner</p>
          </div>
        </div>

        <button className="text-xs text-need flex items-center gap-1" onClick={onOpenNeeds}>
          <span>View all</span>
          <ArrowRight size={12} />
        </button>
      </div>

      <div className="reserve-metrics-grid">
        <div className="metric-box">
          <span className="metric-label">Target to Reserve</span>
          <span className="metric-value font-mono">
            {formatINR(monthlyReserveTargetPaise)}
          </span>
        </div>

        <div className="metric-box">
          <span className="metric-label">Contributed</span>
          <span className="metric-value font-mono text-success">
            {formatINR(contributedThisMonthPaise)}
          </span>
        </div>

        <div className="metric-box">
          <span className="metric-label">Remaining to Set Aside</span>
          <span
            className={`metric-value font-mono ${remainingToReservePaise > 0 ? 'text-need' : 'text-success'}`}
          >
            {formatINR(remainingToReservePaise)}
          </span>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-3)' }}>
        <div className="flex items-center justify-between text-xs" style={{ marginBottom: 4 }}>
          <span className="text-secondary">Monthly Reserve Funded</span>
          <span className="font-mono text-need">{progressPercent}%</span>
        </div>
        <ProgressBar value={contributedThisMonthPaise} max={monthlyReserveTargetPaise} color="need" />
      </div>

      {needs.length > 0 && (
        <div className="needs-mini-list">
          {needs.slice(0, 3).map((need) => (
            <div key={need.id} className="need-mini-item">
              <span className="need-mini-name">{need.name}</span>
              <span className="need-mini-stat font-mono">
                {formatINR(need.contributedPaise)} / {formatINR(need.targetPaise)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
