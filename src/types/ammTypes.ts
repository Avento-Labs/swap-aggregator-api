type AMMName = 'Uniswap' | 'Sushiswap';

enum AMMAddress {
  'Uniswap' = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  'Sushiswap' = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F',
}

type AMMData = {
  ammName: AMMName;
  ammAddress: AMMAddress;
  liquidity: number;
  swapRate: number;
  slippage: number;
};

type CallData = {
  target: AMMAddress;
  data: string;
};

export { AMMName, AMMAddress, AMMData, CallData };
