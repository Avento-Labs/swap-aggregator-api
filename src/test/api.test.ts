import 'dotenv/config';
import axios from 'axios';
import { ethers, utils } from 'ethers';
import { abi as aggregatorAbi } from '../abi/aggregator.abi';
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
);

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
  // console.log('Call data:', response.data);
  return response.data;
}

// Function to send a transaction using ethers.js
async function sendTransaction(callData: CallData[]): Promise<void> {
  const tx: TransactionParams = {
    to: aggregatorContract.address,
    data: aggregatorContract.interface.encodeFunctionData('execute', [callData]),
  };

  const transaction = await wallet.sendTransaction(tx);
  await transaction.wait();
  console.log(`Transaction hash: ${transaction.hash}`);
}

// Main function to execute the test
async function testSwap(): Promise<void> {
  const tokenIn = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  const tokenOut = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  const amount = utils.parseEther('100'); // Example amount, adjust as necessary

  try {
    const callData: CallData[] = await fetchCallData(
      wallet.address,
      tokenIn,
      tokenOut,
      amount.toString()
    );
    await sendTransaction(callData);
    console.log('Wallet balance:', utils.formatEther(await wallet.getBalance()).toString());
  } catch (error) {
    console.error('Error in testSwap:', error);
  }
}

// Run the test
testSwap();
