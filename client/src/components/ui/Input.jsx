import React from 'react';
import './Input.css';

export function Input({
  label,
  error,
  helperText,
  id,
  type = 'text',
  className = '',
  prefix,
  suffix,
  ...props
}) {
  const inputId = id || props.name || Math.random().toString(36).substring(2, 9);

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div className={`input-wrapper ${error ? 'input-error' : ''}`}>
        {prefix && <span className="input-prefix">{prefix}</span>}
        <input id={inputId} type={type} className="form-input" {...props} />
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
      {error && <p className="form-error">{error}</p>}
      {helperText && !error && <p className="form-helper">{helperText}</p>}
    </div>
  );
}
