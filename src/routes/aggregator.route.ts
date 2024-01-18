import express from 'express';
import { getSwapCallData } from '../controllers/aggregator.controller';

const router = express.Router();

// Route for initiating a token swap
router.get('/aggregate/calldata', getSwapCallData);

export default router;
