export const TREASURY_ADDRESS =
  '0x2efa15af9a998444667acef1385131f654f0215d1ec13ae4580fff33a8e99f15';

// TODO: Replace after publishing Move package
export const SUICRED_PACKAGE_ID = '0x2efa15af9a998444667acef1385131f654f0215d1ec13ae4580fff33a8e99f15';
export const SUICRED_MODULE = 'suicred';
export const SUICRED_MINT_FUNCTION = 'mint_score';

export const MINT_PRICE_SUI = 0.01;

export const NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK || 'mainnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet';
