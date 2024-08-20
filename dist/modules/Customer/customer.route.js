"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const customer_controller_1 = require("./customer.controller");
const router = (0, express_1.Router)();
router.post("/create-appointment", auth_1.default, customer_controller_1.createAppointment);
exports.CustomerRoutes = router;
