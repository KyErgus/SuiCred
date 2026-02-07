export const TREASURY_ADDRESS =
  '0x1a71da3526155ebb27f04bdc4d24a0925ee32d4a5c4600e201ecc0d3776065c3';

// TODO: Replace after publishing Move package
export const SUICRED_PACKAGE_ID = '0x1a71da3526155ebb27f04bdc4d24a0925ee32d4a5c4600e201ecc0d3776065c3';
export const SUICRED_MODULE = 'suicred';
export const SUICRED_MINT_FUNCTION = 'mint_score';

export const MINT_PRICE_SUI = 0.01;

export const NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK || 'mainnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet';
