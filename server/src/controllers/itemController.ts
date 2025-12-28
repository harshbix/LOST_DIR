import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../config/db';

interface AuthRequest extends Request {
    user?: any;
}

export const createItem = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, category, status, location, imageUrl } = req.body;
        const db = getDb();

        const result = await db.collection('items').insertOne({
            title,
            description,
            category,
            status,
            location,
            imageUrl,
            owner: new ObjectId(req.user.id),
            state: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        res.status(201).json({ _id: result.insertedId, ...req.body });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getItems = async (req: Request, res: Response) => {
    try {
        const { status, category, search, sort, sortBy } = req.query;
        let query: any = {};

        if (status) query.status = status;
        if (category) query.category = category;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
            ];
        }

        let sortQuery: any = { createdAt: -1 };
        if (sort === 'oldest') sortQuery = { createdAt: 1 };
        if (sort === 'az') sortQuery = { title: 1 };
        if (sort === 'za') sortQuery = { title: -1 };
        if (sortBy === 'updated') sortQuery = { updatedAt: -1 };

        const db = getDb();
        const items = await db.collection('items')
            .aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'owner',
                        foreignField: '_id',
                        as: 'ownerInfo'
                    }
                },
                { $unwind: '$ownerInfo' },
                {
                    $project: {
                        'ownerInfo.password': 0,
                    }
                },
                { $sort: sortQuery }
            ]).toArray();

        // Map ownerInfo to owner to match client expectation
        const formattedItems = items.map(item => ({
            ...item,
            owner: item.ownerInfo
        }));

        res.json(formattedItems);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getItemById = async (req: Request, res: Response) => {
    try {
        const db = getDb();
        const item = await db.collection('items')
            .aggregate([
                { $match: { _id: new ObjectId(req.params.id) } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'owner',
                        foreignField: '_id',
                        as: 'ownerInfo'
                    }
                },
                { $unwind: '$ownerInfo' },
                {
                    $project: {
                        'ownerInfo.password': 0,
                    }
                }
            ]).toArray();

        if (item.length > 0) {
            res.json({ ...item[0], owner: item[0].ownerInfo });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const updateItemStatus = async (req: AuthRequest, res: Response) => {
    try {
        const db = getDb();
        const collection = db.collection('items');

        const item = await collection.findOne({ _id: new ObjectId(req.params.id) });

        if (item) {
            if (item.owner.toString() !== req.user.id) {
                return res.status(401).json({ message: 'User not authorized' });
            }

            const updatedState = req.body.state || item.state;
            await collection.updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: { state: updatedState, updatedAt: new Date() } }
            );

            res.json({ ...item, state: updatedState });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getMyItems = async (req: AuthRequest, res: Response) => {
    try {
        const db = getDb();
        const items = await db.collection('items')
            .find({ owner: new ObjectId(req.user.id) })
            .sort({ createdAt: -1 })
            .toArray();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
export const deleteItem = async (req: AuthRequest, res: Response) => {
    try {
        const db = getDb();
        const collection = db.collection('items');

        const item = await collection.findOne({ _id: new ObjectId(req.params.id) });

        if (item) {
            if (item.owner.toString() !== req.user.id) {
                return res.status(401).json({ message: 'User not authorized' });
            }

            await collection.deleteOne({ _id: new ObjectId(req.params.id) });
            res.json({ message: 'Item removed' });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
