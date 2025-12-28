import express from 'express';
import { createLossReport, getMyLossReports } from '../controllers/lossReportController';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.post('/', protect, createLossReport);
router.get('/', protect, getMyLossReports);

export default router;
