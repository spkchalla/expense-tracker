import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner.jsx';
import { formatFullDateTime } from '../../lib/formatters.js';
import { ArrowLeft, History } from 'lucide-react';

export function AdminAuditPage({ onBack }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const res = await api.getAdminAuditLogs();
        if (res && res.success) {
          setLogs(res.data);
        }
      } catch (err) {
        alert(err.message || 'Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="container">
      <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-4)' }}>
        <Button size="sm" variant="ghost" icon={ArrowLeft} onClick={onBack}>
          Back to Admin
        </Button>
        <div>
          <h2 className="text-xl" style={{ fontWeight: 700 }}>
            Administrative Audit Trail
          </h2>
          <p className="text-xs text-secondary">
            Immutable log of role, suspension, and privilege mutations
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching audit trail..." />
      ) : logs.length === 0 ? (
        <Card>
          <p className="text-sm text-secondary" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
            No administrative actions recorded yet.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {logs.map((log) => (
            <Card key={log._id}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-primary">{log.action}</span>
                <span className="text-xs text-muted font-mono">
                  {formatFullDateTime(log.timestamp)}
                </span>
              </div>

              <div className="text-xs text-secondary" style={{ marginTop: 4 }}>
                <strong>Actor:</strong> {log.actorUserId?.displayName || 'System'} ({log.actorUserId?.email || 'system'})
                {' → '}
                <strong>Target:</strong> {log.targetUserId?.displayName} ({log.targetUserId?.email})
              </div>

              <pre
                style={{
                  marginTop: 'var(--space-2)',
                  padding: 'var(--space-2)',
                  backgroundColor: 'var(--bg-input)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)',
                  overflowX: 'auto',
                }}
              >
                {JSON.stringify(log.changedFields, null, 2)}
              </pre>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
