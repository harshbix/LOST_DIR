import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'lostfound';

let db: Db;
let client: MongoClient;

const connectDB = async () => {
    try {
        client = new MongoClient(url);
        await client.connect();
        db = client.db(dbName);
        console.log(`MongoDB Native Driver Connected: ${url}`);
        return db;
    } catch (error) {
        console.error(`Error: ${(error as Error).message}`);
        process.exit(1);
    }
};

const getDb = () => {
    if (!db) {
        throw new Error('Database not initialized. Call connectDB first.');
    }
    return db;
};

export { connectDB, getDb, client };
export default connectDB;
