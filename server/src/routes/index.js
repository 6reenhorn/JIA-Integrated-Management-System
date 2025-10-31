"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const authRoutes = require("./auth");
const employeeRoutes = require("./employees");
const router = express.Router();
// Mount routes
router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
// Add more routes here as needed
module.exports = router;
