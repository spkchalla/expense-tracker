import React from 'react';
import { Button } from './Button.jsx';

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-8) var(--space-4)',
        gap: 'var(--space-3)',
      }}
    >
      {Icon && (
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-surface-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            marginBottom: 'var(--space-2)',
          }}
        >
          <Icon size={24} />
        </div>
      )}
      <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
        {title}
      </h4>
      {description && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 360 }}>
          {description}
        </p>
      )}
      {actionText && onAction && (
        <div style={{ marginTop: 'var(--space-2)' }}>
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}
