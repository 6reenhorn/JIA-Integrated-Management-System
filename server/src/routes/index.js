"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const authRoutes = require("./auth");
const employeeRoutes = require("./employees");
const gcashRoutes = require("./gcash");
const paymayaRoutes = require("./paymaya");
const juanpayRoutes = require("./juanpay");
const inventoryRoutes = require("./inventory");
const payrollRoutes = require("./payroll");

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/gcash', gcashRoutes);
router.use('/paymaya', paymayaRoutes);
router.use('/juanpay', juanpayRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/payroll', payrollRoutes);

// Add more routes here as needed
module.exports = router;