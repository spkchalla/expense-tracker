import { describe, it, expect } from 'vitest';
import {
  formatINR,
  paiseToRupees,
  rupeesToPaise,
  formatMonthName,
  generateUUID,
} from '../src/lib/formatters.js';

describe('Frontend Formatters and Utilities', () => {
  it('converts between rupees and paise accurately', () => {
    expect(rupeesToPaise(150)).toBe(15000);
    expect(rupeesToPaise(12.5)).toBe(1250);
    expect(rupeesToPaise('250.75')).toBe(25075);

    expect(paiseToRupees(15000)).toBe(150);
    expect(paiseToRupees(1250)).toBe(12.5);
    expect(paiseToRupees(0)).toBe(0);
  });

  it('formats INR currency with proper symbol and grouping', () => {
    const formatted = formatINR(150000); // 1500 INR
    expect(formatted).toContain('1,500');
    expect(formatted).toMatch(/₹|INR/);
  });

  it('formats YYYY-MM to readable full month and year', () => {
    expect(formatMonthName('2026-11')).toBe('November 2026');
    expect(formatMonthName('2026-01')).toBe('January 2026');
  });

  it('generates valid UUIDv4 strings for client transaction idempotency', () => {
    const uuid1 = generateUUID();
    const uuid2 = generateUUID();
    expect(uuid1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(uuid1).not.toBe(uuid2);
  });
});

import { buildUrl } from '../src/lib/api.js';

describe('API URL Builder', () => {
  it('constructs correct API URLs with endpoints', () => {
    const loginUrl = buildUrl('/auth/login');
    expect(loginUrl).toContain('/api/auth/login');

    const categoriesUrl = buildUrl('/categories?includeArchived=true');
    expect(categoriesUrl).toContain('/api/categories?includeArchived=true');

    // Handles missing leading slash safely
    const meUrl = buildUrl('auth/me');
    expect(meUrl).toContain('/api/auth/me');
  });
});
