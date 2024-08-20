"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const employee_controller_1 = require("./employee.controller");
const router = (0, express_1.Router)();
router.post('/create-and-update-attendance', auth_1.default, employee_controller_1.createAttendance);
exports.EmployeeRoutes = router;
