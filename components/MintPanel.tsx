'use client';

import { useMemo, useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransactionBlock } from '@mysten/dapp-kit';
import { TransactionBlock } from '@mysten/sui/transactions';
import { MINT_PRICE_SUI, SUICRED_MINT_FUNCTION, SUICRED_MODULE, SUICRED_PACKAGE_ID } from '@/lib/config';
import { ScoreResult } from '@/lib/scoring';

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
    const tierBytes = Array.from(new TextEncoder().encode(score.tier));

    tx.moveCall({
      target: `${SUICRED_PACKAGE_ID}::${SUICRED_MODULE}::${SUICRED_MINT_FUNCTION}`,
      arguments: [tx.pure(score.total), tx.pure(tierBytes), payment]
    });

    const result = await signAndExecute({
      transactionBlock: tx,
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
