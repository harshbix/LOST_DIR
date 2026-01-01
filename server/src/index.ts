import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/auth';
import itemRoutes from './routes/item';
import locationRoutes from './routes/location';
import lossReportRoutes from './routes/lossReport';
import claimRoutes from './routes/claim';
import { notFound, errorHandler } from './middlewares/errorMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database and Start Server
const startServer = async () => {
    try {
        try {
            await connectDB();
        } catch (dbErr) {
            console.error('Warning: could not connect to MongoDB:', (dbErr as Error).message || dbErr);
            console.error('Continuing to start server; DB operations will fail until connection is restored.');
        }

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Middleware
app.use(cors());
app.use(express.json());

// Log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/items', itemRoutes);
app.use('/locations', locationRoutes);
app.use('/loss-reports', lossReportRoutes);
app.use('/claims', claimRoutes);

app.get('/', (req, res) => {
    res.send('Lost & Found API is running...');
});

// Error Handling
app.use(notFound);
app.use(errorHandler);

startServer();
