import express from 'express';
import authRoutes from './auth';
import employeeRoutes from './employees';
import gcashRoutes from './gcash';
import paymayaRoutes from './paymaya';
import inventoryRoutes from './inventoryRoutes';
import payrollRoutes from './payroll';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/gcash', gcashRoutes);
router.use('/paymaya', paymayaRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/payroll', payrollRoutes);

// Add more routes here as needed

export default router;
