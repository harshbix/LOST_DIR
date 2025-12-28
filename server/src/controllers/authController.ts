import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDb } from '../config/db';

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'your_super_secret_key_change_this_later', {
        expiresIn: '30d',
    });
};

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        const db = getDb();
        const collection = db.collection('users');

        const userExists = await collection.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await collection.insertOne({
            name,
            email,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        if (result.acknowledged) {
            res.status(201).json({
                _id: result.insertedId,
                name,
                email,
                token: generateToken(result.insertedId.toString()),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const db = getDb();
        const user = await db.collection('users').findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id.toString()),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getProfile = async (req: any, res: Response) => {
    try {
        const db = getDb();
        const user = await db.collection('users').findOne({ _id: req.user.id });
        if (user) {
            const { password, ...userData } = user;
            res.json(userData);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const updateProfile = async (req: any, res: Response) => {
    try {
        const { name, email } = req.body;
        const db = getDb();
        const collection = db.collection('users');

        // Check if email is already taken by another user
        if (email) {
            const existingUser = await collection.findOne({ email, _id: { $ne: req.user.id } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already taken' });
            }
        }

        const updateData: any = { updatedAt: new Date() };
        if (name) updateData.name = name;
        if (email) updateData.email = email;

        const result = await collection.findOneAndUpdate(
            { _id: req.user.id },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (result) {
            const { password, ...updatedUser } = result;
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
