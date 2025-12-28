import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../config/db';

interface AuthRequest extends Request {
    user?: any;
}

export const createClaim = async (req: AuthRequest, res: Response) => {
    try {
        const { itemId, lossReportId } = req.body;
        const db = getDb();

        // 1. Fetch Item and Loss Report
        const item = await db.collection('items').findOne({ _id: new ObjectId(itemId) });
        const report = await db.collection('loss_reports').findOne({ _id: new ObjectId(lossReportId) });

        if (!item || !report) {
            return res.status(404).json({ message: 'Item or Report not found' });
        }

        // 2. Prevent Duplicate Claims
        const existingClaim = await db.collection('claims').findOne({
            itemId: new ObjectId(itemId),
            claimantId: new ObjectId(req.user.id)
        });

        if (existingClaim) {
            return res.status(400).json({ message: 'You have already claimed this item' });
        }

        // 3. Match Logic (Simplistic for Demo)
        let matchScore = 0;
        const itemTitle = (item.title || '').toLowerCase();
        const reportDesc = (report.description || '').toLowerCase();

        // rudimentary word overlap
        const itemWords = itemTitle.split(' ');
        let overlap = 0;
        itemWords.forEach((w: string) => {
            if (w.length > 3 && reportDesc.includes(w)) overlap++;
        });

        matchScore = Math.min(100, (overlap * 20));

        // Location check (loose check)
        if (item.location && report.description && report.description.toLowerCase().includes(item.location.toLowerCase())) {
            matchScore += 20;
        }

        // Cap at 100
        if (matchScore > 100) matchScore = 100;
        if (matchScore < 20) matchScore = 20; // Baseline for trying


        const result = await db.collection('claims').insertOne({
            itemId: new ObjectId(itemId),
            finderId: item.owner, // ID of the person who found it
            claimantId: new ObjectId(req.user.id),
            lossReportId: new ObjectId(lossReportId),
            status: 'pending', // pending, accepted, rejected, returned
            matchScore,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        res.status(201).json({
            _id: result.insertedId,
            matchScore,
            status: 'pending',
            message: 'Claim submitted successfully'
        });

    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getMyClaims = async (req: AuthRequest, res: Response) => {
    try {
        const { type } = req.query; // 'filed' (I claimed) or 'received' (Someone claimed my item)
        const db = getDb();
        let query: any = {};

        if (type === 'received') {
            query.finderId = new ObjectId(req.user.id);
        } else {
            query.claimantId = new ObjectId(req.user.id);
        }

        const claims = await db.collection('claims').aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'items',
                    localField: 'itemId',
                    foreignField: '_id',
                    as: 'item'
                }
            },
            { $unwind: '$item' },
            {
                $lookup: {
                    from: 'users',
                    localField: type === 'received' ? 'claimantId' : 'finderId',
                    foreignField: '_id',
                    as: 'otherParty'
                }
            },
            { $unwind: '$otherParty' },
            {
                $project: {
                    'otherParty.password': 0
                }
            },
            { $sort: { createdAt: -1 } }
        ]).toArray();

        res.json(claims);

    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const updateClaimStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'accepted', 'rejected', 'returned'
        const db = getDb();

        const claim = await db.collection('claims').findOne({ _id: new ObjectId(id) });
        if (!claim) return res.status(404).json({ message: 'Claim not found' });

        // Only finder can accept/reject
        // Only finder (or both?) can mark as returned. For now, finder controls it.
        if (claim.finderId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to update this claim' });
        }

        await db.collection('claims').updateOne(
            { _id: new ObjectId(id) },
            { $set: { status, updatedAt: new Date() } }
        );

        // If returned, update item status too
        if (status === 'returned') {
            await db.collection('items').updateOne(
                { _id: claim.itemId },
                { $set: { status: 'returned', state: 'resolved' } }
            );
        }

        res.json({ message: `Claim ${status}` });

    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
