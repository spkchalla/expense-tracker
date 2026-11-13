import React, { useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Wallet } from 'lucide-react';

export function RegisterPage({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 10) {
      setError('Password must be at least 10 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await register({ displayName, email, password });
    } catch (err) {
      setError(err.message || 'Registration failed.');
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
      <div style={{ width: '100%', maxWidth: '400px' }}>
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
            Start managing your mandatory reserves and flexible spend
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 className="text-lg" style={{ marginBottom: 'var(--space-4)' }}>
              Create Account
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
              label="Your Name or Nickname"
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />

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
              label="Password (min. 10 characters)"
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
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
              Register & Setup
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
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  style={{
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                    textDecoration: 'underline',
                  }}
                >
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
