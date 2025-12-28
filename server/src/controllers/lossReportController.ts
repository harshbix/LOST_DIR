import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../config/db';

interface AuthRequest extends Request {
    user?: any;
    file?: any;
}

export const createLossReport = async (req: AuthRequest, res: Response) => {
    try {
        const { reportType, IncidentDate, policeStation, description } = req.body;
        // In a real app, req.file.path would be the image url. 
        // For this demo, we assume the client might send a URL or we use the file if uploaded.
        // Let's assume for now we just store the metadata and a placeholder or file path.

        const imageUrl = req.file ? req.file.path : (req.body.imageUrl || '');

        // Intelligent Verification Simulation
        let verificationStatus = 'pending';
        let confidenceScore = 0;
        let verificationNotes = [];

        const lowerDesc = (description || '').toLowerCase();
        const lowerStation = (policeStation || '').toLowerCase();

        // Check for Tanzania context
        if (lowerDesc.includes('jeshi') || lowerStation.includes('jeshi') || lowerDesc.includes('police')) {
            confidenceScore += 30;
            verificationNotes.push('Police terminology detected');
        }
        if (lowerDesc.includes('tanzania') || lowerStation.includes('tanzania')) {
            confidenceScore += 20;
            verificationNotes.push('National context detected');
        }
        if (req.body.reportNumber) {
            confidenceScore += 30;
            verificationNotes.push('Report Reference Number provided');
        }

        // Presence of image
        if (imageUrl) {
            confidenceScore += 20;
            verificationNotes.push('Document image attached');
        }

        if (confidenceScore >= 80) verificationStatus = 'verified';
        else if (confidenceScore >= 50) verificationStatus = 'likely_valid';
        else verificationStatus = 'needs_review';

        const db = getDb();
        const result = await db.collection('loss_reports').insertOne({
            userId: new ObjectId(req.user.id),
            reportType, // 'Theft', 'Lost'
            incidentDate: new Date(IncidentDate),
            policeStation,
            reportNumber: req.body.reportNumber,
            description,
            imageUrl,
            verificationStatus,
            confidenceScore,
            verificationNotes,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        res.status(201).json({
            _id: result.insertedId,
            status: verificationStatus,
            score: confidenceScore,
            message: 'Loss report submitted successfully'
        });

    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getMyLossReports = async (req: AuthRequest, res: Response) => {
    try {
        const db = getDb();
        const reports = await db.collection('loss_reports')
            .find({ userId: new ObjectId(req.user.id) })
            .sort({ createdAt: -1 })
            .toArray();
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
