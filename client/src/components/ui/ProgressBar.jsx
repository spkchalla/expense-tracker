import React from 'react';
import './ProgressBar.css';

export function ProgressBar({
  value = 0,
  max = 100,
  color = 'primary', // 'primary', 'success', 'warning', 'danger', 'need'
  height = 8,
  showLabel = false,
  className = '',
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / (max || 1)) * 100)));

  return (
    <div className={`progress-container ${className}`}>
      {showLabel && (
        <div className="progress-label-row">
          <span className="text-xs text-secondary">Progress</span>
          <span className="text-xs font-mono">{percentage}%</span>
        </div>
      )}
      <div className="progress-track" style={{ height: `${height}px` }}>
        <div
          className={`progress-fill progress-fill-${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
