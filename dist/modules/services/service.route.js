"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRoutes = void 0;
const express_1 = require("express");
const services_controller_1 = require("./services.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const fileUploadNormal_1 = __importDefault(require("../../middlewares/fileUploadNormal"));
const router = (0, express_1.Router)();
router.post('/add-service', auth_1.default, fileUploadNormal_1.default.single('image'), services_controller_1.createService);
router.get('/get-service', auth_1.default, services_controller_1.getService);
router.patch('/update-service', auth_1.default, fileUploadNormal_1.default.single('image'), services_controller_1.updateService);
router.get('/single-service', auth_1.default, services_controller_1.singleService);
exports.ServiceRoutes = router;
