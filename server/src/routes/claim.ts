import express from 'express';
import { createClaim, getMyClaims, updateClaimStatus } from '../controllers/claimController';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.post('/', protect, createClaim);
router.get('/', protect, getMyClaims);
router.patch('/:id/status', protect, updateClaimStatus);

export default router;
