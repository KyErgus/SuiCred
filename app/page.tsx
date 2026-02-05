'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { WalletPanel } from '@/components/WalletPanel';
import { TwitterPanel } from '@/components/TwitterPanel';
import { ScoreCard } from '@/components/ScoreCard';
import { ScoreBreakdown } from '@/components/ScoreBreakdown';
import { MintPanel } from '@/components/MintPanel';
import { ActivityPanel } from '@/components/ActivityPanel';
import { calculateScore, emptyStats, ScoreResult, WalletStats } from '@/lib/scoring';
import { createSuiClient, fetchWalletStats } from '@/lib/sui';
import { NETWORK } from '@/lib/config';

export default function Home() {
  const account = useCurrentAccount();
  const [stats, setStats] = useState<WalletStats>(() => emptyStats(''));
  const [score, setScore] = useState<ScoreResult>(() =>
    calculateScore(emptyStats(''))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const address = account?.address;
    if (!address) {
      const blank = emptyStats('');
      setStats(blank);
      setScore(calculateScore(blank));
      return;
    }

    const client = createSuiClient(NETWORK);
    setLoading(true);
    setError(null);

    fetchWalletStats(client, address)
      .then((data) => {
        setStats(data);
        setScore(calculateScore(data));
      })
      .catch((err) => {
        setError('Failed to load on-chain data. You may be rate-limited.');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [account?.address]);

  const statusLabel = useMemo(() => {
    if (!account?.address) return 'Connect a wallet to begin.';
    if (loading) return 'Fetching on-chain data...';
    if (error) return error;
    return 'Your SuiCred score is ready.';
  }, [account?.address, loading, error]);

  return (
    <main>
      <section className="hero">
        <div className="logo">
          <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <path
              d="M32 6C22 18 12 28 12 38c0 11 9 20 20 20s20-9 20-20C52 28 42 18 32 6Z"
              stroke="#44e3ff"
              strokeWidth="3"
            />
            <path d="M22 38c4 6 9 9 14 9" stroke="#7cff6b" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <strong>SuiCred</strong>
        </div>
        <h1>Check your Sui Cred</h1>
        <span className="badge">{statusLabel}</span>
      </section>

      <div className="grid" style={{ marginBottom: 18 }}>
        <WalletPanel />
        <TwitterPanel />
        <MintPanel score={score} />
      </div>

      <ScoreCard score={score} />

      <div className="grid" style={{ marginTop: 18 }}>
        <ActivityPanel stats={stats} />
        <ScoreBreakdown score={score} />
      </div>
    </main>
  );
}
