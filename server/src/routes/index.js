"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const authRoutes = require("./auth");
const employeeRoutes = require("./employees");
const gcashRoutes = require("./gcash");
const paymayaRoutes = require("./paymaya");
const inventoryRoutes = require("./inventory");
const payrollRoutes = require("./payroll");
const attendanceRoutes = require("./attendance");

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/gcash', gcashRoutes);
router.use('/paymaya', paymayaRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/payroll', payrollRoutes);
router.use('/attendance', attendanceRoutes);

// Add more routes here as needed
module.exports = router;
