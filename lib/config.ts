export const TREASURY_ADDRESS =
  '0x82ebab744e4334e71d1f1e4d72768bb56455e1063d9c4d82e8193a034625901b';

// TODO: Replace after publishing Move package
export const SUICRED_PACKAGE_ID = '0x82ebab744e4334e71d1f1e4d72768bb56455e1063d9c4d82e8193a034625901b';
export const SUICRED_MODULE = 'suicred';
export const SUICRED_MINT_FUNCTION = 'mint_score';

export const MINT_PRICE_SUI = 0.01;

export const NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK || 'mainnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet';
