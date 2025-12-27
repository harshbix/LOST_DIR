import { Request, Response } from 'express';
import Item from '../models/Item';

interface AuthRequest extends Request {
    user?: any;
}

export const createItem = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, category, status, location, imageUrl } = req.body;
        const item = await Item.create({
            title,
            description,
            category,
            status,
            location,
            imageUrl,
            owner: req.user.id,
        });
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getItems = async (req: Request, res: Response) => {
    try {
        const { status, category, search } = req.query;
        let query: any = {};

        if (status) query.status = status;
        if (category) query.category = category;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const items = await Item.find(query).sort({ createdAt: -1 }).populate('owner', 'name email');
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getItemById = async (req: Request, res: Response) => {
    try {
        const item = await Item.findById(req.params.id).populate('owner', 'name email');
        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const updateItemStatus = async (req: AuthRequest, res: Response) => {
    try {
        const item = await Item.findById(req.params.id);
        if (item) {
            if (item.owner.toString() !== req.user.id) {
                return res.status(401).json({ message: 'User not authorized' });
            }
            item.state = req.body.state || item.state;
            const updatedItem = await item.save();
            res.json(updatedItem);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getMyItems = async (req: AuthRequest, res: Response) => {
    try {
        const items = await Item.find({ owner: req.user.id }).sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
