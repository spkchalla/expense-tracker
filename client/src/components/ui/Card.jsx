import React from 'react';
import './Card.css';

export function Card({
  children,
  title,
  subtitle,
  action,
  className = '',
  onClick,
  variant = 'default',
}) {
  return (
    <div
      className={`card card-${variant} ${onClick ? 'card-clickable' : ''} ${className}`}
      onClick={onClick}
    >
      {(title || action || subtitle) && (
        <div className="card-header">
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {action && <div className="card-action">{action}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
}
