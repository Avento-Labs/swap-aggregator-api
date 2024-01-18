import { Request, Response } from 'express';
import { constructSwapCallData } from '../services/aggregator.service';
import { ethers } from 'ethers';
import { CallData } from '../types/ammTypes';

export const getSwapCallData = async (req: Request, res: Response) => {
  try {
    const { amount } = req.query;
    let { userAddress, tokenIn, tokenOut } = req.query;

    if (!userAddress || !tokenIn || !tokenOut || !amount) {
      res.status(400).json({ error: 'Missing query parameters' });
      return;
    }
    userAddress = userAddress!.toString().toLowerCase();
    tokenIn = tokenIn!.toString().toLowerCase();
    tokenOut = tokenOut!.toString().toLowerCase();

    if (
      !ethers.utils.isAddress(userAddress) ||
      !ethers.utils.isAddress(tokenIn) ||
      !ethers.utils.isAddress(tokenOut)
    ) {
      res.status(400).json({ error: 'Invalid address for user, tokenIn, or tokenOut' });
      return;
    }
    const callData: CallData[] = await constructSwapCallData(
      userAddress as string,
      tokenIn as string,
      tokenOut as string,
      Number.parseInt(amount as string)
    );

    res.json(callData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
