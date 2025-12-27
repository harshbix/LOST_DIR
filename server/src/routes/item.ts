import express from 'express';
import { createItem, getItems, getItemById, updateItemStatus, getMyItems, deleteItem } from '../controllers/itemController';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.route('/')
    .post(protect, createItem)
    .get(getItems);

router.get('/me', protect, getMyItems);

router.route('/:id')
    .get(getItemById)
    .patch(protect, updateItemStatus)
    .delete(protect, deleteItem);

export default router;
