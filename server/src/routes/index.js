"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const authRoutes = require("./auth");
const employeeRoutes = require("./employees");
const gcashRoutes = require("./gcash");
const paymayaRoutes = require("./paymaya");

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/gcash', gcashRoutes);
router.use('/paymaya', paymayaRoutes); 

// Add more routes here as needed
module.exports = router;
