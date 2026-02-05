export type DeFiActivity = {
  swaps: number;
  lends: number;
  lps: number;
  stakes: number;
  protocols: string[];
};

export type WalletStats = {
  address: string;
  balanceSui: number;
  totalTx: number;
  activeDays: number;
  firstSeenDaysAgo: number;
  volumeSui: number;
  defi: DeFiActivity;
  nftMints: number;
  uniqueTokens: number;
  failedTxRate: number; // 0-1
};

export type ScoreBreakdown = {
  label: string;
  points: number;
  max: number;
  note: string;
};

export type ScoreResult = {
  total: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  breakdown: ScoreBreakdown[];
  kpis: {
    activityIndex: number;
    defiIndex: number;
    longevityIndex: number;
  };
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const tierFromScore = (score: number): ScoreResult['tier'] => {
  if (score >= 900) return 'Diamond';
  if (score >= 780) return 'Platinum';
  if (score >= 620) return 'Gold';
  if (score >= 450) return 'Silver';
  return 'Bronze';
};

export function calculateScore(stats: WalletStats): ScoreResult {
  const breakdown: ScoreBreakdown[] = [];

  const activity = clamp(stats.totalTx / 1200, 0, 1) * 220;
  breakdown.push({
    label: 'On-chain Activity',
    points: Math.round(activity),
    max: 220,
    note: `${stats.totalTx} total transactions`
  });

  const consistency = clamp(stats.activeDays / 180, 0, 1) * 140;
  breakdown.push({
    label: 'Consistency',
    points: Math.round(consistency),
    max: 140,
    note: `${stats.activeDays} active days`
  });

  const longevity = clamp(stats.firstSeenDaysAgo / 540, 0, 1) * 120;
  breakdown.push({
    label: 'Longevity',
    points: Math.round(longevity),
    max: 120,
    note: `${stats.firstSeenDaysAgo} days since first activity`
  });

  const balance = clamp(Math.log10(stats.balanceSui + 1) / 4, 0, 1) * 120;
  breakdown.push({
    label: 'Balance Strength',
    points: Math.round(balance),
    max: 120,
    note: `${stats.balanceSui.toFixed(2)} SUI balance`
  });

  const volume = clamp(Math.log10(stats.volumeSui + 1) / 4, 0, 1) * 120;
  breakdown.push({
    label: 'Volume Gravity',
    points: Math.round(volume),
    max: 120,
    note: `${stats.volumeSui.toFixed(2)} SUI volume`
  });

  const defiDepth = clamp(
    (stats.defi.swaps * 0.6 + stats.defi.lends * 0.9 + stats.defi.lps * 1.1 + stats.defi.stakes * 0.8) /
      60,
    0,
    1
  ) * 180;
  breakdown.push({
    label: 'DeFi Depth',
    points: Math.round(defiDepth),
    max: 180,
    note: `${stats.defi.protocols.length} protocols`
  });

  const diversity = clamp(stats.uniqueTokens / 25, 0, 1) * 80;
  breakdown.push({
    label: 'Asset Diversity',
    points: Math.round(diversity),
    max: 80,
    note: `${stats.uniqueTokens} unique tokens`
  });

  const nftBuilder = clamp(stats.nftMints / 12, 0, 1) * 40;
  breakdown.push({
    label: 'NFT Builder',
    points: Math.round(nftBuilder),
    max: 40,
    note: `${stats.nftMints} mints`
  });

  const reliabilityPenalty = clamp(stats.failedTxRate, 0, 0.25) * 120;
  breakdown.push({
    label: 'Reliability',
    points: Math.round(120 - reliabilityPenalty),
    max: 120,
    note: `${Math.round(stats.failedTxRate * 100)}% failure rate`
  });

  const total = breakdown.reduce((sum, item) => sum + item.points, 0);

  return {
    total,
    tier: tierFromScore(total),
    breakdown,
    kpis: {
      activityIndex: Math.round(activity + consistency),
      defiIndex: Math.round(defiDepth + diversity),
      longevityIndex: Math.round(longevity + balance)
    }
  };
}

export const emptyStats = (address: string): WalletStats => ({
  address,
  balanceSui: 0,
  totalTx: 0,
  activeDays: 0,
  firstSeenDaysAgo: 0,
  volumeSui: 0,
  defi: { swaps: 0, lends: 0, lps: 0, stakes: 0, protocols: [] },
  nftMints: 0,
  uniqueTokens: 0,
  failedTxRate: 0
});
