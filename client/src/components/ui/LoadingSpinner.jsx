import React from 'react';

export function LoadingSpinner({ text = 'Loading...', size = 'md' }) {
  const dim = size === 'sm' ? 18 : size === 'lg' ? 36 : 24;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8)',
        gap: 'var(--space-3)',
      }}
    >
      <div
        style={{
          width: `${dim}px`,
          height: `${dim}px`,
          border: '3px solid rgba(255, 255, 255, 0.1)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      {text && <p className="text-sm text-secondary">{text}</p>}
    </div>
  );
}
