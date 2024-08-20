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
exports.createAttendance = void 0;
const Response_1 = __importDefault(require("../../utils/Response"));
const employee_model_1 = __importDefault(require("./employee.model"));
const calculateTotalWorkingHours = (attendance) => {
    const checkInTime = attendance.checkIn ? new Date(attendance.checkIn).getTime() : 0;
    const checkOutTime = attendance.checkOut ? new Date(attendance.checkOut).getTime() : 0;
    const breakTimeInTime = attendance.BreakTimeIn ? new Date(attendance.BreakTimeIn).getTime() : 0;
    const breakTimeOutTime = attendance.BreakTimeOut ? new Date(attendance.BreakTimeOut).getTime() : 0;
    const workingTime = checkOutTime - checkInTime;
    const breakTime = breakTimeOutTime - breakTimeInTime;
    const totalWorkingTime = workingTime - breakTime;
    return totalWorkingTime > 0 ? totalWorkingTime / (1000 * 60 * 60) : 0; // Convert to hours
};
const createAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRole = req.userRole;
        if (userRole !== "EMPLOYEE") {
            return res.status(401).json((0, Response_1.default)({
                statusCode: 401,
                status: "failed",
                message: "You are not authorized to perform this action",
            }));
        }
        const { status } = req.query;
        // Validate the status
        if (status !== "checkIn" &&
            status !== "checkOut" &&
            status !== "BreakTimeIn" &&
            status !== "BreakTimeOut") {
            return res.status(400).json((0, Response_1.default)({
                statusCode: 400,
                status: "failed",
                message: "Invalid status",
            }));
        }
        const userId = req.userId;
        const today = new Date().toISOString().split("T")[0];
        // Get the current time (only time part, like "10:00 AM")
        const currentTime = new Date();
        const timeOnly = new Date();
        timeOnly.setHours(currentTime.getHours(), currentTime.getMinutes(), 0, 0); // Set hours and minutes, reset seconds and milliseconds
        console.log(timeOnly);
        // Check if the attendance record for today and this user already exists
        const existingAttendance = yield employee_model_1.default.findOne({
            userId,
            date: new Date(today),
        });
        if (existingAttendance) {
            // Update the existing record based on the status
            switch (status) {
                case "checkIn":
                    existingAttendance.checkIn = timeOnly;
                    break;
                case "checkOut":
                    existingAttendance.checkOut = timeOnly;
                    break;
                case "BreakTimeIn":
                    existingAttendance.BreakTimeIn = timeOnly;
                    break;
                case "BreakTimeOut":
                    existingAttendance.BreakTimeOut = timeOnly;
                    break;
                default:
                    break;
            }
            // Calculate the total working hours
            existingAttendance.totalWorkingHours =
                calculateTotalWorkingHours(existingAttendance);
            yield existingAttendance.save();
            return res.status(200).json((0, Response_1.default)({
                statusCode: 200,
                status: "success",
                message: "Attendance updated successfully",
                data: existingAttendance,
            }));
        }
        else {
            // Create a new attendance record and set the relevant field based on status
            const newAttendanceData = {
                userId,
                date: new Date(today),
            };
            switch (status) {
                case "checkIn":
                    newAttendanceData.checkIn = timeOnly;
                    break;
                case "checkOut":
                    newAttendanceData.checkOut = timeOnly;
                    break;
                case "BreakTimeIn":
                    newAttendanceData.BreakTimeIn = timeOnly;
                    break;
                case "BreakTimeOut":
                    newAttendanceData.BreakTimeOut = timeOnly;
                    break;
                default:
                    break;
            }
            newAttendanceData.totalWorkingHours = calculateTotalWorkingHours(newAttendanceData);
            const newAttendance = new employee_model_1.default(newAttendanceData);
            yield newAttendance.save();
            return res.status(201).json((0, Response_1.default)({
                statusCode: 201,
                status: "success",
                message: "Attendance created successfully",
                data: newAttendance,
            }));
        }
    }
    catch (error) {
        console.log("Error in createAttendance controller: ", error);
        res.status(500).json({
            statusCode: 500,
            status: "failed",
            message: "Internal Server Error",
        });
    }
});
exports.createAttendance = createAttendance;
