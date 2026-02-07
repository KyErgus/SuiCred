'use client';

import { useMemo, useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransactionBlock } from '@mysten/dapp-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { MINT_PRICE_SUI, SUICRED_MINT_FUNCTION, SUICRED_MODULE, SUICRED_PACKAGE_ID } from '@/lib/config';
import { ScoreResult } from '@/lib/scoring';

const tierFromScore = (score: number) => {
  if (score >= 500) return 'Sui';
  if (score >= 350) return 'Diamond';
  if (score >= 300) return 'Gold';
  if (score >= 200) return 'Silver';
  return 'Bronze';
};

const tierStyles: Record<string, { title: string; colors: string[] }> = {
  Bronze: { title: 'Bronze', colors: ['#8b5a2b', '#c1894b', '#e6b57a'] },
  Silver: { title: 'Silver', colors: ['#9aa0a6', '#cfd5db', '#f5f7f9'] },
  Gold: { title: 'Gold', colors: ['#b8860b', '#ffd36e', '#fff2b2'] },
  Diamond: { title: 'Diamond', colors: ['#1bd5ff', '#7cfffa', '#c8f6ff'] },
  Sui: { title: 'Sui', colors: ['#2ee6ff', '#8bf7ff', '#c7fbff'] }
};

const svgCard = (score: number, tier: string) => {
  const style = tierStyles[tier] || tierStyles.Bronze;
  const [c1, c2, c3] = style.colors;
  if (tier === 'Sui') {
    return `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="480" viewBox="0 0 800 480">
  <defs>
    <radialGradient id="bg" cx="50%" cy="20%" r="80%">
      <stop offset="0%" stop-color="${c3}"/>
      <stop offset="60%" stop-color="${c2}"/>
      <stop offset="100%" stop-color="${c1}"/>
    </radialGradient>
  </defs>
  <rect width="800" height="480" rx="36" fill="url(#bg)"/>
  <path d="M400 70c-90 120-150 170-150 240a150 150 0 0 0 300 0c0-70-60-120-150-240z" fill="rgba(0,0,0,0.08)"/>
  <path d="M400 90c-80 110-130 155-130 215a130 130 0 0 0 260 0c0-60-50-105-130-215z" fill="rgba(255,255,255,0.35)"/>
  <text x="50%" y="52%" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-size="72" fill="#0a0f1f" font-weight="700">${score}</text>
  <text x="50%" y="62%" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-size="28" fill="#0a0f1f">Sui Cred</text>
</svg>`;
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="480" viewBox="0 0 800 480">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="55%" stop-color="${c2}"/>
      <stop offset="100%" stop-color="${c3}"/>
    </linearGradient>
    <linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.05)"/>
      <stop offset="50%" stop-color="rgba(255,255,255,0.5)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.05)"/>
    </linearGradient>
  </defs>
  <rect width="800" height="480" rx="36" fill="url(#bg)"/>
  <rect x="24" y="24" width="752" height="432" rx="28" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
  <rect x="0" y="120" width="800" height="100" fill="url(#shine)" opacity="0.6"/>
  <text x="60" y="140" font-family="Space Grotesk, sans-serif" font-size="32" fill="rgba(10,15,31,0.8)" font-weight="700">${style.title}</text>
  <text x="60" y="200" font-family="Space Grotesk, sans-serif" font-size="64" fill="#0a0f1f" font-weight="700">${score}</text>
  <text x="60" y="250" font-family="Space Grotesk, sans-serif" font-size="24" fill="rgba(10,15,31,0.7)">SuiCred Score</text>
  <text x="60" y="380" font-family="Space Grotesk, sans-serif" font-size="20" fill="rgba(10,15,31,0.7)">Minted on Sui</text>
</svg>`;
};

export function MintPanel({ score }: { score: ScoreResult }) {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute, isPending } = useSignAndExecuteTransactionBlock();
  const [lastDigest, setLastDigest] = useState<string | null>(null);
  const canMint = Boolean(account?.address);

  const mintLabel = useMemo(() => {
    if (!account?.address) return 'Connect Wallet';
    return isPending ? 'Minting...' : 'Mint SuiCred for 1 SUI';
  }, [account?.address, isPending]);

  const onMint = async () => {
    if (!account?.address) return;

    const tx = new TransactionBlock();
    const [payment] = tx.splitCoins(tx.gas, [tx.pure(Math.floor(MINT_PRICE_SUI * 1e9))]);
    const tier = tierFromScore(score.total);
    const svg = svgCard(score.total, tier);
    const imageUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    const imageBytes = Array.from(new TextEncoder().encode(imageUrl));

    tx.moveCall({
      target: `${SUICRED_PACKAGE_ID}::${SUICRED_MODULE}::${SUICRED_MINT_FUNCTION}`,
      arguments: [tx.pure(score.total), tx.pure(imageBytes), payment]
    });

    const result = await signAndExecute({
      // dapp-kit bundles its own sui.js copy; cast to avoid type mismatch in build.
      transactionBlock: tx as unknown as Parameters<typeof signAndExecute>[0]['transactionBlock'],
      options: { showEffects: true }
    });

    if (result?.digest) setLastDigest(result.digest);
  };

  return (
    <div className="card">
      <h3>Mint</h3>
      <div className="score-label">
        Mint your score for 1 SUI. The payment is transferred directly to the treasury address.
      </div>
      <button className="button" onClick={onMint} disabled={!canMint || isPending} style={{ marginTop: 16 }}>
        {mintLabel}
      </button>
      {lastDigest && (
        <div className="badge" style={{ marginTop: 12 }}>
          Mint Tx: {lastDigest.slice(0, 10)}...{lastDigest.slice(-6)}
        </div>
      )}
    </div>
  );
}
