"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var auth_1 = require("./auth");
var router = express_1.default.Router();
// Mount routes
router.use('/auth', auth_1.default);
// Add more routes here as needed
exports.default = router;
