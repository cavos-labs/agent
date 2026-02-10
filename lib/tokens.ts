export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
}

export const TOKENS_SEPOLIA: TokenInfo[] = [
  {
    symbol: 'ETH',
    name: 'Ether',
    address: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
    decimals: 18,
  },
  {
    symbol: 'STRK',
    name: 'Starknet',
    address: '0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D',
    decimals: 18,
  },
];

export const TOKENS_MAINNET: TokenInfo[] = [
  {
    symbol: 'ETH',
    name: 'Ether',
    address: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
    decimals: 18,
  },
  {
    symbol: 'STRK',
    name: 'Starknet',
    address: '0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D',
    decimals: 18,
  },
];

export function getTokens(network: string): TokenInfo[] {
  return network === 'mainnet' ? TOKENS_MAINNET : TOKENS_SEPOLIA;
}

export function getTokenBySymbol(symbol: string, network: string): TokenInfo | undefined {
  return getTokens(network).find(t => t.symbol === symbol);
}
