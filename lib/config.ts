export const TREASURY_ADDRESS =
  '0xce5c72750ddcbfbead5c3690c580a7835eab6dacfef98f36cb167fc9f351e87f';

// TODO: Replace after publishing Move package
export const SUICRED_PACKAGE_ID = '0xYOUR_PACKAGE_ID';
export const SUICRED_MODULE = 'suicred';
export const SUICRED_MINT_FUNCTION = 'mint_score';

export const MINT_PRICE_SUI = 1;

export const NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK || 'mainnet') as
  | 'mainnet'
  | 'testnet'
  | 'devnet';
