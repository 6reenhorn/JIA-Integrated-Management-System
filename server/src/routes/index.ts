import express from 'express';
import authRoutes from './auth';
import employeeRoutes from './employees';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);

// Add more routes here as needed

export default router;
