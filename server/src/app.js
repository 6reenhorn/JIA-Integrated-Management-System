"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const routes = require("./routes/index");
var app = express();
// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routes
app.use('/api', routes);
// Health check
app.get('/health', function (req, res) {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});
module.exports = app;
