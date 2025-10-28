"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var helmet_1 = require("helmet");
var index_1 = require("./routes/index");
var app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api', index_1.default);
// Health check
app.get('/health', function (req, res) {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});
exports.default = app;
