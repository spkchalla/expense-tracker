import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { api } from '../../lib/api.js';
import { LogOut, Key, Check, User, Sparkles } from 'lucide-react';

export function ProfilePage({ deferredPrompt, onInstallApp }) {
  const { user, logout, updateProfile } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    try {
      setProfileSaving(true);
      await updateProfile({ displayName });
      setProfileMsg('Profile updated successfully.');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');

    if (newPassword.length < 10) {
      setPasswordError('New password must be at least 10 characters long.');
      return;
    }

    try {
      setPasswordSaving(true);
      await api.changePassword({ currentPassword, newPassword });
      setPasswordMsg('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordMsg(''), 3000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="container">
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h2 className="text-xl" style={{ fontWeight: 700 }}>
          Profile & App Settings
        </h2>
        <p className="text-xs text-secondary">Manage your account credentials and app preferences</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {/* PWA Install Promo if available */}
        {deferredPrompt && (
          <Card className="card-elevated" style={{ borderColor: 'var(--color-primary)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base" style={{ fontWeight: 600 }}>
                  Install Pocket Ledger App
                </h4>
                <p className="text-xs text-secondary">
                  Install on your home screen for quick offline access
                </p>
              </div>
              <Button size="sm" variant="primary" icon={Sparkles} onClick={onInstallApp}>
                Install PWA
              </Button>
            </div>
          </Card>
        )}

        {/* Account Details */}
        <Card title="Account Overview">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">Email</span>
              <span className="font-mono text-sm">{user?.email}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">Account Role</span>
              <Badge variant={user?.role === 'admin' ? 'need' : 'default'}>
                {user?.role?.toUpperCase()}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">Feature Privileges</span>
              <div className="flex gap-1">
                {user?.privileges && user.privileges.length > 0 ? (
                  user.privileges.map((p) => (
                    <Badge key={p} size="sm" variant="success">
                      {p}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted">Standard</span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Edit Profile */}
        <Card title="Edit Display Name">
          <form onSubmit={handleUpdateProfile}>
            {profileMsg && (
              <p className="text-xs text-success" style={{ marginBottom: 'var(--space-2)' }}>
                {profileMsg}
              </p>
            )}
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
            <Button type="submit" size="sm" variant="primary" isLoading={profileSaving}>
              Save Name
            </Button>
          </form>
        </Card>

        {/* Change Password */}
        <Card title="Change Password">
          <form onSubmit={handleChangePassword}>
            {passwordMsg && (
              <p className="text-xs text-success" style={{ marginBottom: 'var(--space-2)' }}>
                {passwordMsg}
              </p>
            )}
            {passwordError && (
              <p className="text-xs text-danger" style={{ marginBottom: 'var(--space-2)' }}>
                {passwordError}
              </p>
            )}

            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <Input
              label="New Password (min 10 characters)"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              size="sm"
              variant="secondary"
              icon={Key}
              isLoading={passwordSaving}
            >
              Update Password
            </Button>
          </form>
        </Card>

        {/* Logout */}
        <div style={{ marginTop: 'var(--space-2)' }}>
          <Button
            variant="danger"
            fullWidth
            icon={LogOut}
            onClick={() => logout(false)}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
