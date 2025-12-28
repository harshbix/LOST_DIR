import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'lostfound';

let db: Db | null = null;
let client: MongoClient | null = null;

const connectDB = async () => {
    try {
        client = new MongoClient(url);
        await client.connect();
        db = client.db(dbName);
        console.log(`MongoDB Native Driver Connected: ${url}`);
        return db;
    } catch (error) {
        console.error(`MongoDB connection failed: ${(error as Error).message}`);
        console.error('Server will continue to run but database operations will return errors until connection is restored.');
        // Do not exit process here so the API can start and return proper 5xx responses instead of crashing.
        db = null;
        return null;
    }
};

const getDb = () => {
    if (!db) {
        throw new Error('Database not initialized. Please ensure MongoDB is reachable and restart the server.');
    }
    return db;
};

export { connectDB, getDb, client };
export default connectDB;
