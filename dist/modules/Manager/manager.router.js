"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagerRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const manager_controller_1 = require("./manager.controller");
const router = (0, express_1.Router)();
router.post('/create-account', auth_1.default, manager_controller_1.createManager);
router.post('/create-and-update-attendance', auth_1.default, manager_controller_1.createManager);
router.get('/get-customers', auth_1.default, manager_controller_1.getCustomers);
router.get('/get-customers/:id', auth_1.default, manager_controller_1.getSingleCustomer);
router.get('/get-employee', auth_1.default, manager_controller_1.getEmployees);
router.get('/get-employee/:id', auth_1.default, manager_controller_1.getSingleEmployee);
router.get('/get-service', auth_1.default, manager_controller_1.getService);
router.get('/get-appointment-request/:id', auth_1.default, manager_controller_1.getAppointmentRequest);
router.post('/assign-employee', auth_1.default, manager_controller_1.assignEmployee);
exports.ManagerRoutes = router;