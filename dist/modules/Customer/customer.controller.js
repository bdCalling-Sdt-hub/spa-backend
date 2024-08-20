"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppointment = void 0;
const Response_1 = __importDefault(require("../../utils/Response"));
const customer_model_1 = __importDefault(require("./customer.model"));
const createAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRole = req.userRole;
        if (userRole !== "USER") {
            return res.status(401).json((0, Response_1.default)({
                statusCode: 401,
                status: "failed",
                message: "You are not authorized to perform this action",
            }));
        }
        const { serviceId, customerEmail, customerAddress, customerPhone, AppointmentDate, appointmentNote, } = req.body;
        if (!serviceId ||
            !customerEmail ||
            !customerAddress ||
            !customerPhone ||
            !AppointmentDate ||
            !appointmentNote) {
            return res.status(400).json((0, Response_1.default)({
                statusCode: 400,
                status: "failed",
                message: "All fields are required",
            }));
        }
        const createAppointment = yield customer_model_1.default.create({
            user: req.userId,
            service: serviceId,
            customerEmail,
            customerAddress,
            customerPhone,
            AppointmentDate,
            appointmentNote,
        });
        if (!createAppointment) {
            return res.status(400).json((0, Response_1.default)({
                statusCode: 400,
                status: "failed",
                message: "Failed to create appointment",
            }));
        }
        res.status(200).json((0, Response_1.default)({
            statusCode: 200,
            status: "success",
            message: "Appointment created successfully",
            data: createAppointment,
        }));
    }
    catch (error) {
        console.log("Error in createAppointment controller: ", error);
        res.status(500).json((0, Response_1.default)({
            statusCode: 500,
            status: "failed",
            message: "Internal Server Error",
        }));
    }
});
exports.createAppointment = createAppointment;
