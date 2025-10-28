import express from 'express';
import authRoutes from './auth';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);

// Add more routes here as needed

export default router;
