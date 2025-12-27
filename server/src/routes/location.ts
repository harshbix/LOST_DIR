import express from 'express';
import { searchLocations } from '../controllers/locationController';
import { protect } from '../middlewares/auth';

const router = express.Router();

// We don't necessarily need to protect search if it's public data, 
// but adding it ensures only users use our API resources.
router.get('/search', protect, searchLocations);

export default router;
