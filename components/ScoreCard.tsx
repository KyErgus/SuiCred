'use client';

import { useEffect, useMemo, useState } from 'react';
import { ScoreResult } from '@/lib/scoring';
import clsx from 'clsx';

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    let raf: number;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

export function ScoreCard({ score }: { score: ScoreResult }) {
  const displayScore = useCountUp(score.total);
  const tierTone = useMemo(() => {
    switch (score.tier) {
      case 'Diamond':
        return 'Ultra Rare';
      case 'Platinum':
        return 'Prime Aura';
      case 'Gold':
        return 'Airdrop Ready';
      case 'Silver':
        return 'Rising Streak';
      default:
        return 'New Signal';
    }
  }, [score.tier]);

  return (
    <section className="score-shell">
      <div className="score-content">
        <span className="badge">SuiCred Tier • {score.tier}</span>
        <div className="score-value">{displayScore}</div>
        <div className="score-label">On-chain Reputation Score</div>
        <div className="score-burst">{tierTone} • Airdrop mode engaged</div>
        <div className="kpi">
          <div>
            <strong>{score.kpis.activityIndex}</strong>
            <div className="score-label">Activity Index</div>
          </div>
          <div>
            <strong>{score.kpis.defiIndex}</strong>
            <div className="score-label">DeFi Index</div>
          </div>
          <div>
            <strong>{score.kpis.longevityIndex}</strong>
            <div className="score-label">Longevity Index</div>
          </div>
        </div>
      </div>
    </section>
  );
}
