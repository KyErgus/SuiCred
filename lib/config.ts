export const TREASURY_ADDRESS =
  '0x395f0eea894d3a0c19933b2a186e7b7d295ddfa0ef366a6d1a6b1abe5805969c';

// TODO: Replace after publishing Move package
export const SUICRED_PACKAGE_ID = '0x395f0eea894d3a0c19933b2a186e7b7d295ddfa0ef366a6d1a6b1abe5805969c';
export const SUICRED_MODULE = 'suicred';
export const SUICRED_MINT_FUNCTION = 'mint_score';

export const MINT_PRICE_SUI = 0.01;

export const NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK || 'mainnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet';
