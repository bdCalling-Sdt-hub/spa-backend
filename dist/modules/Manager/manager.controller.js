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
exports.assignEmployee = exports.getAppointmentRequest = exports.getService = exports.getSingleEmployee = exports.getEmployees = exports.getSingleCustomer = exports.getCustomers = exports.createManager = void 0;
const Response_1 = __importDefault(require("../../utils/Response"));
const user_model_1 = __importDefault(require("../User/user.model"));
const paginationBuilder_1 = __importDefault(require("../../utils/paginationBuilder"));
const service_model_1 = __importDefault(require("../services/service.model"));
const customer_model_1 = __importDefault(require("../Customer/customer.model"));
const employeeAssign_model_1 = __importDefault(require("../Manager/Model/employeeAssign.model"));
const notification_model_1 = __importDefault(require("./Model/notification.model"));
const createManager = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRole = req.userRole;
        if (userRole !== "ADMIN") {
            return res.status(403).json({
                statusCode: 403,
                status: "failed",
                message: "You are not authorized to perform this action",
            });
        }
        const { name, email, password, phone } = req.body;
        if (!name || !email || !password || !phone) {
            return res.status(400).json((0, Response_1.default)({
                statusCode: 400,
                status: "failed",
                message: "All fields are required",
            }));
        }
        const user = yield user_model_1.default.create({
            name,
            email,
            role: "MANAGER",
            password,
            isVerified: true,
        });
        return res.status(200).json((0, Response_1.default)({
            statusCode: 200,
            status: "success",
            message: "Manager created successfully",
            data: user,
        }));
    }
    catch (error) {
        console.log("Error in createManager controller: ", error);
        res.status(500).json((0, Response_1.default)({
            statusCode: 500,
            status: "failed",
            message: "Internal Server Error",
        }));
    }
});
exports.createManager = createManager;
const getCustomers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRole = req.userRole;
        if (userRole !== "MANAGER") {
            return res.status(403).json({
                statusCode: 403,
                status: "failed",
                message: "You are not authorized to perform this action",
            });
        }
        // Get pagination parameters from query, with default values
        const currentPage = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        // Calculate the number of documents to skip
        const skip = (currentPage - 1) * limit;
        // Get the search query parameter
        const search = req.query.search;
        // Build the query object for filtering
        const query = { role: "USER" };
        if (search) {
            query.$or = [
                { name: { $regex: new RegExp(search, "i") } },
                { email: { $regex: new RegExp(search, "i") } },
            ];
        }
        // Fetch total customer count and customers for the current page
        const totalData = yield user_model_1.default.countDocuments(query);
        const customers = yield user_model_1.default.find(query).skip(skip).limit(limit);
        if (!customers || customers.length === 0) {
            return res.status(404).json((0, Response_1.default)({
                statusCode: 404,
                status: "failed",
                message: "No customers found",
            }));
        }
        // Use paginationBuilder to get pagination details
        const pagination = (0, paginationBuilder_1.default)({
            totalData,
            currentPage,
            limit,
        });
        return res.status(200).json((0, Response_1.default)({
            statusCode: 200,
            status: "success",
            message: "Customers fetched successfully",
            data: customers,
            pagination,
        }));
    }
    catch (error) {
        console.log("Error in getCustomers controller: ", error);
        res.status(500).json((0, Response_1.default)({
            statusCode: 500,
            status: "failed",
            message: "Internal Server Error",
        }));
    }
});
exports.getCustomers = getCustomers;
const getSingleCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRole = req.userRole;
        if (userRole !== "MANAGER") {
            return res.status(403).json({
                statusCode: 403,
                status: "failed",
                message: "You are not authorized to perform this action",
            });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json((0, Response_1.default)({
                statusCode: 400,
                status: "failed",
                message: "Customer ID is required",
            }));
        }
        const customer = yield user_model_1.default.findById(id);
        if (!customer) {
            return res.status(404).json((0, Response_1.default)({
                statusCode: 404,
                status: "failed",
                message: "Customer not found",
            }));
        }
        return res.status(200).json((0, Response_1.default)({
            statusCode: 200,
            status: "success",
            message: "Customer fetched successfully",
            data: customer,
        }));
    }
    catch (error) {
        console.log("Error in getSingleCustomer controller: ", error);
        res.status(500).json((0, Response_1.default)({
            statusCode: 500,
            status: "failed",
            message: "Internal Server Error",
        }));
    }
});
exports.getSingleCustomer = getSingleCustomer;
const getEmployees = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRole = req.userRole;
        if (userRole !== "MANAGER") {
            return res.status(403).json({
                statusCode: 403,
                status: "failed",
                message: "You are not authorized to perform this action",
            });
        }
        // Get pagination parameters from query, with default values
        const currentPage = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        // Calculate the number of documents to skip
        const skip = (currentPage - 1) * limit;
        const search = req.query.search;
        // Build the query object for filtering
        const query = { role: "EMPLOYEE" };
        if (search) {
            query.$or = [
                { name: { $regex: new RegExp(search, "i") } },
                { email: { $regex: new RegExp(search, "i") } },
            ];
        }
        console.log("query: ", search);
        // Fetch total customer count and customers for the current page
        const totalData = yield user_model_1.default.countDocuments(query);
        const employee = yield user_model_1.default.find(query).skip(skip).limit(limit);
        if (!employee || employee.length === 0) {
            return res.status(404).json((0, Response_1.default)({
                statusCode: 404,
                status: "failed",
                message: "No employee found",
            }));
        }
        // Use paginationBuilder to get pagination details
        const pagination = (0, paginationBuilder_1.default)({
            totalData,
            currentPage,
            limit,
        });
        return res.status(200).json((0, Response_1.default)({
            statusCode: 200,
            status: "success",
            message: "Employee fetched successfully",
            data: employee,
            pagination,
        }));
    }
    catch (error) {
        console.log("Error in getEmployees controller: ", error);
        res.status(500).json((0, Response_1.default)({
            statusCode: 500,
            status: "failed",
            message: "Internal Server Error",
        }));
    }
});
exports.getEmployees = getEmployees;
const getSingleEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRole = req.userRole;
        if (userRole !== "MANAGER") {
            return res.status(403).json({
                statusCode: 403,
                status: "failed",
                message: "You are not authorized to perform this action",
            });
        }
        const { id } = req.params;
        if (!id) {
            return res.status(400).json((0, Response_1.default)({
                statusCode: 400,
                status: "failed",
                message: "Employee ID is required",
            }));
        }
        const employee = yield user_model_1.default.findById(id);
        if (!employee) {
            return res.status(404).json((0, Response_1.default)({
                statusCode: 404,
                status: "failed",
                message: "Employee Details not found",
            }));
        }
        return res.status(200).json((0, Response_1.default)({
            statusCode: 200,
            status: "success",
            message: "Employee Details fetched successfully",
            data: employee,
        }));
    }
    catch (error) {
        console.log("Error in getSingleEmployee controller: ", error);
        res.status(500).json((0, Response_1.default)({
            statusCode: 500,
            status: "failed",
            message: "Internal Server Error",
        }));
    }
});
exports.getSingleEmployee = getSingleEmployee;
const getService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json((0, Response_1.default)({
                statusCode: 401,
                status: "failed",
                message: "You are not authorized to perform this action",
            }));
        }
        const service = yield service_model_1.default.find();
        if (!service || service.length === 0) {
            return res.status(404).json((0, Response_1.default)({
                statusCode: 404,
                status: "failed",
                message: "No service found",
            }));
        }
        return res.status(200).json((0, Response_1.default)({
            statusCode: 200,
            status: "success",
            message: "Service fetched successfully",
            data: service,
        }));
    }
    catch (error) {
        console.log("Error in getService controller: ", error);
        res.status(500).json((0, Response_1.default)({
            statusCode: 500,
            status: "failed",
            message: "Internal Server Error",
        }));
    }
});
exports.getService = getService;
const getAppointmentRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.userRole;
        if (user !== "MANAGER") {
            return res.status(403).json((0, Response_1.default)({
                statusCode: 403,
                status: "failed",
                message: "You are not authorized to perform this action",
            }));
        }
        // Get pagination parameters from query, with default values
        const currentPage = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        // Calculate the number of documents to skip
        const skip = (currentPage - 1) * limit;
        const { id } = req.params;
        const totalData = yield customer_model_1.default.countDocuments({ service: id });
        const getAppointmentRequest = yield customer_model_1.default.find({
            service: id,
        })
            .skip(skip)
            .limit(limit)
            .populate("service user");
        if (!getAppointmentRequest || getAppointmentRequest.length === 0) {
            return res.status(404).json((0, Response_1.default)({
                statusCode: 404,
                status: "failed",
                message: "Appointment request not found",
            }));
        }
        // Use paginationBuilder to get pagination details
        const pagination = (0, paginationBuilder_1.default)({
            totalData,
            currentPage,
            limit,
        });
        return res.status(200).json((0, Response_1.default)({
            statusCode: 200,
            status: "success",
            message: "Appointment request fetched successfully",
            data: getAppointmentRequest,
            pagination,
        }));
    }
    catch (error) {
        console.log("Error in getAppointmentRequest controller: ", error);
        res.status(500).json((0, Response_1.default)({
            statusCode: 500,
            status: "failed",
            message: "Internal Server Error",
        }));
    }
});
exports.getAppointmentRequest = getAppointmentRequest;
const assignEmployee = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRole = req.userRole;
        const userId = req.userId;
        if (userRole !== "MANAGER") {
            return res.status(403).json((0, Response_1.default)({
                statusCode: 403,
                status: "failed",
                message: "You are not authorized to perform this action",
            }));
        }
        const { employeeId, appointmentId } = req.body;
        if (!employeeId || !appointmentId) {
            return res.status(400).json((0, Response_1.default)({
                statusCode: 400,
                status: "failed",
                message: "All fields are required",
            }));
        }
        const assignEmployee = yield employeeAssign_model_1.default.create({
            managerId: userId,
            employeeId,
            appointmentId,
        });
        if (!assignEmployee) {
            return res.status(400).json((0, Response_1.default)({
                statusCode: 400,
                status: "failed",
                message: "Failed to assign employee",
            }));
        }
        const updateAppointmentStatus = yield customer_model_1.default.findByIdAndUpdate(appointmentId, { status: "ASSIGNED" }, { new: true });
        if (!updateAppointmentStatus) {
            return res.status(400).json((0, Response_1.default)({
                statusCode: 400,
                status: "failed",
                message: "Failed to update appointment status",
            }));
        }
        const employeeName = yield user_model_1.default.findById(employeeId).select("name");
        const notificationForEmployee = yield notification_model_1.default.create({
            message: `${req.user.name} appointment has been assigned to ${employeeName}`,
            role: "EMPLOYEE",
            recipientId: employeeId,
        });
        io.emit(`notification::${employeeId}`, notificationForEmployee);
        return res.status(200).json((0, Response_1.default)({
            statusCode: 200,
            status: "success",
            message: "Employee assigned successfully",
            data: assignEmployee,
        }));
    }
    catch (error) {
        console.log("Error in AssignEmployee controller: ", error);
        res.status(500).json((0, Response_1.default)({
            statusCode: 500,
            status: "failed",
            message: "Internal Server Error",
        }));
    }
});
exports.assignEmployee = assignEmployee;
