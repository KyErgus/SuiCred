import { WalletStats } from '@/lib/scoring';

export function ActivityPanel({ stats }: { stats: WalletStats }) {
  return (
    <div className="card">
      <h3>Wallet Summary</h3>
      <div className="list">
        <div className="list-item">
          <span>Total Transactions</span>
          <span className="tag">{stats.totalTx}</span>
        </div>
        <div className="list-item">
          <span>Active Days</span>
          <span className="tag">{stats.activeDays}</span>
        </div>
        <div className="list-item">
          <span>First Activity</span>
          <span className="tag">{stats.firstSeenDaysAgo} days ago</span>
        </div>
        <div className="list-item">
          <span>DeFi Protocols</span>
          <span className="tag">{stats.defi.protocols.length}</span>
        </div>
        <div className="list-item">
          <span>Swap / Lend / LP</span>
          <span className="tag">
            {stats.defi.swaps} / {stats.defi.lends} / {stats.defi.lps}
          </span>
        </div>
      </div>
    </div>
  );
}
