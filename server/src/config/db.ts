import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'lostandfound';

let db: Db | null = null;
let client: MongoClient | null = null;

const connectDB = async (retries = 5, delayMs = 2000) => {
    let attempt = 0;
    while (attempt < retries) {
        try {
            client = new MongoClient(url);
            await client.connect();
            db = client.db(dbName);
            console.log(`MongoDB Native Driver Connected: ${url}/${dbName}`);
            return db;
        } catch (error) {
            attempt++;
            console.error(`MongoDB connection attempt ${attempt} failed: ${(error as Error).message}`);
            if (attempt >= retries) {
                throw error;
            }
            await new Promise((r) => setTimeout(r, delayMs));
        }
    }
    throw new Error('Failed to connect to MongoDB');
};

const getDb = () => {
    if (!db) {
        throw new Error('Database not initialized. Please ensure MongoDB is reachable and restart the server.');
    }
    return db;
};

export { connectDB, getDb, client };
export default connectDB;
