'use client';

import { useEffect, useState } from 'react';

type Profile = {
  id: string;
  username: string;
  name?: string;
} | null;

export function TwitterPanel() {
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/auth/twitter/me')
      .then((res) => res.json())
      .then((data) => setProfile(data.profile ?? null))
      .catch(() => setProfile(null));
  }, []);

  const onConnect = () => {
    setLoading(true);
    window.location.href = '/api/auth/twitter/start';
  };

  const onLogout = async () => {
    await fetch('/api/auth/twitter/logout', { method: 'POST' });
    setProfile(null);
  };

  return (
    <div className="card">
      <h3>Twitter Program</h3>
      <div className="score-label">Verify your Twitter identity and boost your SuiCred profile.</div>
      <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
        <button className="button secondary" onClick={onConnect} disabled={loading}>
          {profile ? 'Twitter Connected' : loading ? 'Redirecting...' : 'Connect Twitter'}
        </button>
        {profile && (
          <button className="button secondary" onClick={onLogout}>
            Sign Out
          </button>
        )}
      </div>
      {profile && (
        <div className="badge" style={{ marginTop: 12 }}>
          @{profile.username}
        </div>
      )}
    </div>
  );
}
