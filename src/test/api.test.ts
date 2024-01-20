import 'dotenv/config';
import axios from 'axios';
import { ethers, utils } from 'ethers';
import { abi as aggregatorAbi } from '../abi/aggregator.abi';
import { abi as routerAbi } from '../abi/router.abi';
import { CallData } from '../types/ammTypes';

interface TransactionParams {
  to: string;
  data: string;
  value?: string; // Add other transaction parameters as needed
}

// Configuration
const API_URL = 'http://localhost:3000/api/aggregate/calldata';
const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string).connect(provider);
const aggregatorContract = new ethers.Contract(
  process.env.AGGREGATOR_CONTRACT_ADDRESS as string,
  aggregatorAbi,
  provider
).connect(wallet);
const routerContract = new ethers.Contract(
  '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  routerAbi,
  provider
).connect(wallet);

// Function to fetch call data from the API
async function fetchCallData(
  userAddress: string,
  tokenIn: string,
  tokenOut: string,
  amount: number | string
): Promise<CallData[]> {
  const response = await axios.get<CallData[]>(
    `${API_URL}?userAddress=${userAddress}&tokenIn=${tokenIn}&tokenOut=${tokenOut}&amount=${amount}`
  );
  return response.data;
}

async function approveToken(tokenAddress: string, operator: string, amount: string) {
  const token = new ethers.Contract(
    tokenAddress,
    [
      'function approve(address spender, uint256 amount) public returns (bool)',
      'function allowance(address owner, address spender) public view returns (uint256)',
    ],
    provider
  ).connect(wallet);
  const allowance = await token.allowance(wallet.address, operator);
  console.log('Allowance:', utils.formatUnits(allowance, 6).toString());
  if (allowance.lt(amount)) {
    const tx = await token.approve(operator, amount);
    await tx.wait();
    console.log(`Transaction hash: ${tx.hash}`);
  }
}

// Function to send a transaction using ethers.js
async function sendTransaction(callData: CallData[], value: number | string): Promise<any> {
  try {
    // const receipt = await aggregatorContract.execute(callData, { value: value });
    const tx = {
      to: aggregatorContract.address,
      data: aggregatorContract.interface.encodeFunctionData('execute', [callData]),
      value: value,
    };
    const receipt = await wallet.sendTransaction(tx);
    await receipt.wait();
    return receipt;
  } catch (error) {
    console.error('Error in sendTransaction: ', error);
  }
}

async function swapEthForTokens(
  ethAmount: number | string,
  tokenAddress: string,
  recipient: string
) {
  // Set up the transaction parameters
  const txParams = {
    value: ethers.utils.parseEther(ethAmount.toString()), // Amount of ETH to swap
    gasLimit: '210000',
  };

  // Deadline for the swap (current time + 300 seconds)
  const deadline = Math.floor(Date.now() / 1000) + 300;

  // Execute the swap
  const tx = await routerContract.swapExactETHForTokens(
    0,
    ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', tokenAddress],
    recipient, // Recipient address
    deadline,
    txParams
  );

  // Wait for the transaction to be mined
  const receipt = await tx.wait();

  return receipt;
}

// Main function to execute the test
async function testSwap(): Promise<void> {
  const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  const tokenIn = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const tokenOut = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  const ehtAmount = 1;
  const swapAmount = utils.parseEther('1');

  try {
    // Swap ETH for USDT
    // const swapReceipt = await swapEthForTokens(ehtAmount, tokenIn, wallet.address);

    const callData: CallData[] = await fetchCallData(
      wallet.address,
      tokenIn,
      tokenOut,
      swapAmount.toString()
    );

    console.log('Call data:', callData);

    // await approveToken(tokenIn, routerContract.address, swapAmount.toString());
    const aggregateReceipt = await sendTransaction(callData, swapAmount.toString());
    console.log('Swap receipt:', aggregateReceipt);

    console.log('Wallet balance:', utils.formatEther(await wallet.getBalance()).toString());

    const USDT = new ethers.Contract(
      tokenOut,
      [
        'function balanceOf(address account) public view returns (uint256)',
        'function transfer(address recipient, uint256 amount) public returns (bool)',
      ],
      provider
    );
    console.log(
      'USDT balance:',
      utils.formatUnits(await USDT.balanceOf(wallet.address), 6).toString()
    );

    // check weth balance
    // const WETH = new ethers.Contract(
    //   tokenOut,
    //   [
    //     'function balanceOf(address account) public view returns (uint256)',
    //     'function transfer(address recipient, uint256 amount) public returns (bool)',
    //   ],
    //   provider
    // );
    // const wethBalance = utils.parseEther(await WETH.balanceOf(wallet.address));
    // console.log('WETH balance:', wethBalance.toString());
  } catch (error) {
    console.error('Error in testSwap:', error);
  }
}

// Run the test
testSwap();
