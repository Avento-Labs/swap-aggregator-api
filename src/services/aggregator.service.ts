import { ethers } from 'ethers';
import { AMMAddress, AMMName, AMMData, CallData } from '../types/ammTypes';
import { abi as routerABI } from '../abi/router.abi';

// Mock function to get data from an AMM - dummy logic
async function getAMMData(
  ammName: AMMName,
  tokenIn: string,
  tokenOut: string,
  amount: number
): Promise<AMMData> {
  // dummy logic for the sake of an example
  return {
    ammName,
    ammAddress: AMMAddress[ammName],
    liquidity: Math.random() * 100000,
    swapRate: Math.random(),
    slippage: Math.random() * 0.05,
  };
}

// Function to dynamically select AMMs based on certain criteria
async function selectAMMsDynamically(
  tokenIn: string,
  tokenOut: string,
  amount: number
): Promise<AMMData[]> {
  const ammNames: AMMName[] = ['Uniswap', 'Sushiswap'];
  const ammDataPromises = ammNames.map((ammName) => getAMMData(ammName, tokenIn, tokenOut, amount));
  const ammDatas = await Promise.all(ammDataPromises);

  return ammDatas
    .filter((amm) => amm.liquidity > amount)
    .sort((a, b) => a.slippage - b.slippage)
    .slice(0, 2)
    .map((amm) => amm);
}

// Function to construct call data for an AMM swap
// This function is specific to Uniswap and Sushiswap for `swapExactTokensForTokens` only
function encodeSwapCallData(
  ammAddress: AMMAddress,
  userAddress: string,
  tokenIn: string,
  tokenOut: string,
  amount: number
): string {
  const router = new ethers.Contract(ammAddress, routerABI); // Uniswap or Sushiswap router address

  const amountIn = ethers.utils.parseUnits(amount.toString(), 'ether');
  const amountOutMin = 0;
  const path = sortTokens(tokenIn, tokenOut);
  const to = userAddress;
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time

  const data = router.interface.encodeFunctionData('swapExactTokensForTokens', [
    amountIn,
    amountOutMin,
    path,
    to,
    deadline,
  ]);

  return data;
}

// Main function to execute the swap
export async function constructSwapCallData(
  userAddress: string,
  tokenIn: string,
  tokenOut: string,
  amount: number
): Promise<CallData[]> {
  const selectedAMMs: AMMData[] = await selectAMMsDynamically(tokenIn, tokenOut, amount);
  const callDatas = selectedAMMs.map((amm) => {
    return {
      target: amm.ammAddress,
      data: encodeSwapCallData(amm.ammAddress, userAddress, tokenIn, tokenOut, amount),
    };
  });

  return callDatas;
}

function sortTokens(tokenA: string, tokenB: string): [string, string] {
  if (tokenA.toLowerCase() < tokenB.toLowerCase()) {
    return [tokenA, tokenB];
  } else {
    return [tokenB, tokenA];
  }
}
