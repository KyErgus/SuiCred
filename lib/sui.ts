import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { emptyStats, WalletStats } from './scoring';

export type ProtocolConfig = {
  label: string;
  packages: string[];
  type: 'swap' | 'lend' | 'lp' | 'stake';
};

export const DEFAULT_PROTOCOLS: ProtocolConfig[] = [
  { label: 'Cetus', packages: ['0x1f9b8d'], type: 'swap' },
  { label: 'Turbos', packages: ['0x7fbf7e'], type: 'swap' },
  { label: 'Navi', packages: ['0x2a68b0'], type: 'lend' },
  { label: 'Scallop', packages: ['0x89b9d9'], type: 'lend' },
  { label: 'Aftermath', packages: ['0x8a34d2'], type: 'lp' },
  { label: 'Haedal', packages: ['0xa2f4a8'], type: 'stake' }
];

const DAY_MS = 24 * 60 * 60 * 1000;

export function createSuiClient(network: 'mainnet' | 'testnet' | 'devnet') {
  return new SuiClient({ url: getFullnodeUrl(network) });
}

function shortPackage(packageId: string) {
  return packageId.toLowerCase().slice(0, 8);
}

function collectProtocols(packageIds: string[], protocols: ProtocolConfig[]) {
  const seen = new Set<string>();
  const counts = { swap: 0, lend: 0, lp: 0, stake: 0 };

  for (const pkg of packageIds) {
    const short = shortPackage(pkg);
    for (const protocol of protocols) {
      if (protocol.packages.some((p) => short.startsWith(shortPackage(p)))) {
        seen.add(protocol.label);
        counts[protocol.type] += 1;
      }
    }
  }

  return {
    protocols: Array.from(seen),
    swaps: counts.swap,
    lends: counts.lend,
    lps: counts.lp,
    stakes: counts.stake
  };
}

export async function fetchWalletStats(
  client: SuiClient,
  address: string,
  protocols: ProtocolConfig[] = DEFAULT_PROTOCOLS
): Promise<WalletStats> {
  if (!address) return emptyStats('');

  const [balance, allBalances, txs] = await Promise.all([
    client.getBalance({ owner: address }),
    client.getAllBalances({ owner: address }),
    client.queryTransactionBlocks({
      filter: { FromAddress: address },
      options: { showEffects: true, showInput: true, showEvents: true },
      limit: 200
    })
  ]);

  const balanceSui = Number(balance.totalBalance) / 1e9;
  const uniqueTokens = allBalances.length;

  const digests = txs.data.map((item) => item.digest);
  const txBlocks = await Promise.all(
    digests.map((digest) =>
      client.getTransactionBlock({
        digest,
        options: { showEffects: true, showInput: true, showEvents: true, showBalanceChanges: true }
      })
    )
  );

  const timestamps = txBlocks
    .map((tx) => tx.timestampMs)
    .filter((v): v is string => Boolean(v))
    .map((v) => Number(v));

  const activeDays = new Set(timestamps.map((ts) => Math.floor(ts / DAY_MS))).size;
  const firstSeen = timestamps.length ? Math.min(...timestamps) : Date.now();
  const firstSeenDaysAgo = Math.max(0, Math.floor((Date.now() - firstSeen) / DAY_MS));

  let volumeSui = 0;
  let failedTx = 0;
  let nftMints = 0;
  const packagesTouched: string[] = [];

  for (const tx of txBlocks) {
    const effects = tx.effects;
    if (effects?.status?.status === 'failure') failedTx += 1;

    for (const change of tx.balanceChanges || []) {
      if (change.coinType?.includes('::sui::SUI')) {
        volumeSui += Math.abs(Number(change.amount) / 1e9);
      }
    }

    if (tx.events) {
      for (const event of tx.events) {
        if (event.type?.toLowerCase().includes('nft')) {
          nftMints += 1;
        }
      }
    }

    const inputTxs = (tx as unknown as { input?: { transactions?: Array<any> } }).input?.transactions;
    if (inputTxs) {
      for (const input of inputTxs) {
        if (input?.MoveCall?.package) {
          packagesTouched.push(input.MoveCall.package);
        }
      }
    }
  }

  const defi = collectProtocols(packagesTouched, protocols);
  const failedTxRate = txBlocks.length ? failedTx / txBlocks.length : 0;

  return {
    address,
    balanceSui,
    totalTx: txBlocks.length,
    activeDays,
    firstSeenDaysAgo,
    volumeSui: Number(volumeSui.toFixed(2)),
    defi,
    nftMints,
    uniqueTokens,
    failedTxRate
  };
}
