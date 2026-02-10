import { RpcProvider, num } from 'starknet';

const RPC_URLS: Record<string, string> = {
  sepolia: 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_10/dql5pMT88iueZWl7L0yzT56uVk0EBU4L',
  mainnet: 'https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_10/dql5pMT88iueZWl7L0yzT56uVk0EBU4L',
};

export function getProvider(network: string = 'sepolia'): RpcProvider {
  return new RpcProvider({ nodeUrl: RPC_URLS[network] || RPC_URLS.sepolia });
}

export async function getERC20Balance(
  provider: RpcProvider,
  tokenAddress: string,
  walletAddress: string,
): Promise<bigint> {
  const result = await provider.callContract({
    contractAddress: tokenAddress,
    entrypoint: 'balanceOf',
    calldata: [walletAddress],
  });
  const low = BigInt(result[0]);
  const high = BigInt(result[1]);
  return low + (high << BigInt(128));
}

export function formatBalance(raw: bigint, decimals: number = 18): string {
  const divisor = BigInt(10) ** BigInt(decimals);
  const whole = raw / divisor;
  const remainder = raw % divisor;
  const fractional = remainder.toString().padStart(decimals, '0').slice(0, 4);
  return `${whole}.${fractional}`;
}
