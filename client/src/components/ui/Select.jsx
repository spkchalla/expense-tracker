import React from 'react';
import './Input.css';

export function Select({
  label,
  error,
  helperText,
  id,
  children,
  className = '',
  ...props
}) {
  const selectId = id || props.name || Math.random().toString(36).substring(2, 9);

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
        </label>
      )}
      <div className={`input-wrapper ${error ? 'input-error' : ''}`}>
        <select id={selectId} className="form-select" {...props}>
          {children}
        </select>
      </div>
      {error && <p className="form-error">{error}</p>}
      {helperText && !error && <p className="form-helper">{helperText}</p>}
    </div>
  );
}
