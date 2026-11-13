import React, { useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Wallet } from 'lucide-react';

export function LoginPage({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      await login({ email, password });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div
            style={{
              width: 52,
              height: 52,
              margin: '0 auto var(--space-3)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-subtle)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Wallet size={28} />
          </div>
          <h1 className="text-2xl" style={{ letterSpacing: '-0.5px' }}>
            Pocket Ledger
          </h1>
          <p className="text-sm text-secondary" style={{ marginTop: 'var(--space-1)' }}>
            Personal reserve planner & expense tracker
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 className="text-lg" style={{ marginBottom: 'var(--space-4)' }}>
              Sign In
            </h2>

            {error && (
              <div
                style={{
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--color-danger-subtle)',
                  border: '1px solid rgba(248, 81, 73, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-danger-text)',
                  fontSize: 13,
                  marginBottom: 'var(--space-4)',
                }}
              >
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={loading}
              style={{ marginTop: 'var(--space-2)' }}
            >
              Sign In
            </Button>

            <div
              style={{
                textAlign: 'center',
                marginTop: 'var(--space-4)',
                paddingTop: 'var(--space-4)',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <p className="text-sm text-secondary">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  style={{
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                    textDecoration: 'underline',
                  }}
                >
                  Create one
                </button>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
