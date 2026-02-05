'use client';

import { useCurrentAccount, ConnectButton } from '@mysten/dapp-kit';

export function WalletPanel() {
  const account = useCurrentAccount();

  return (
    <div className="card">
      <h3>Wallet</h3>
      <div className="score-label">Connect your Sui wallet and generate your SuiCred score.</div>
      <div style={{ marginTop: 16 }}>
        <ConnectButton />
      </div>
      {account?.address && (
        <div style={{ marginTop: 12 }} className="badge">
          {account.address.slice(0, 10)}...{account.address.slice(-6)}
        </div>
      )}
    </div>
  );
}
