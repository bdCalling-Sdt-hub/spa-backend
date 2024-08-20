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
exports.singleService = exports.updateService = exports.getService = exports.createService = void 0;
const service_model_1 = __importDefault(require("./service.model"));
const Response_1 = __importDefault(require("../../utils/Response"));
const createService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userRole = req.userRole;
        console.log("userRole: ", userRole);
        if (userRole !== "ADMIN") {
            return res.status(403).json({
                statusCode: 403,
                status: "failed",
                message: "Toy don't have permission to perform this action",
            });
        }
        const { name, description } = req.body;
        if (!name || !description) {
            return res.status(400).json({
                statusCode: 400,
                status: "failed",
                message: "All fields are required",
            });
        }
        let image = {};
        if (req.file) {
            image = {
                publicFileURL: `images/users/${(_a = req.file) === null || _a === void 0 ? void 0 : _a.filename}`,
                path: `public\\images\\users\\${(_b = req.file) === null || _b === void 0 ? void 0 : _b.filename}`,
            };
        }
        const createService = yield service_model_1.default.create({
            name,
            description,
            image,
        });
        res.status(200).json((0, Response_1.default)({
            statusCode: 200,
            status: "success",
            message: "Service created successfully",
            data: createService,
        }));
    }
    catch (error) {
        console.log("Error in createService controller: ", error);
        res.status(500).json({
            statusCode: 500,
            status: "failed",
            message: "Internal Server Error",
        });
    }
});
exports.createService = createService;
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
        if (!service) {
            return res.status(404).json((0, Response_1.default)({
                statusCode: 404,
                status: "failed",
                message: "Service not found",
            }));
        }
        res.status(200).json((0, Response_1.default)({
            statusCode: 200,
            status: "success",
            message: "Service fetched successfully",
            data: service,
        }));
    }
    catch (error) {
        console.log("Error in getService controller: ", error);
        res.status(500).json({
            statusCode: 500,
            status: "failed",
            message: "Internal Server Error",
        });
    }
});
exports.getService = getService;
const updateService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const user = req.userRole;
        if (user !== "ADMIN") {
            return res.status(401).json((0, Response_1.default)({
                statusCode: 401,
                status: "failed",
                message: "You are not authorized to perform this action",
            }));
        }
        const { id } = req.query;
        if (!id) {
            return res.status(404).json((0, Response_1.default)({
                statusCode: 404,
                status: "failed",
                message: "Service Id not found",
            }));
        }
        const service = yield service_model_1.default.findById(req.query.id);
        if (!service) {
            return res.status(404).json((0, Response_1.default)({
                statusCode: 404,
                status: "failed",
                message: "Service not found",
            }));
        }
        const { name, description } = req.body;
        let image;
        if (req.file) {
            image = {
                publicFileURL: `images/users/${(_a = req.file) === null || _a === void 0 ? void 0 : _a.filename}`,
                path: `public\\images\\users\\${(_b = req.file) === null || _b === void 0 ? void 0 : _b.filename}`,
            };
        }
        if (name) {
            service.name = name;
            yield service.save();
        }
        if (description) {
            service.description = description;
            yield service.save();
        }
        if (image) {
            service.image = image;
            yield service.save();
        }
        res.status(200).json((0, Response_1.default)({
            statusCode: 200,
            status: "success",
            message: "Service updated successfully",
            data: service,
        }));
    }
    catch (error) {
        console.log("Error in updateService controller: ", error);
        res.status(500).json((0, Response_1.default)({
            statusCode: 500,
            status: "failed",
            message: "Internal Server Error",
        }));
    }
});
exports.updateService = updateService;
const singleService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(404).json((0, Response_1.default)({
                statusCode: 404,
                status: "failed",
                message: "Service Id not found",
            }));
        }
        const user = req.user;
        if (!user) {
            return res.status(401).json((0, Response_1.default)({
                statusCode: 401,
                status: "failed",
                message: "You are not authorized to perform this action",
            }));
        }
        console.log(id);
        const service = yield service_model_1.default.findById(id);
        if (!service) {
            return res.status(404).json((0, Response_1.default)({
                statusCode: 404,
                status: "failed",
                message: "Service not found",
            }));
        }
        res.status(200).json((0, Response_1.default)({
            statusCode: 200,
            status: "success",
            message: "Service fetched successfully",
            data: service,
        }));
    }
    catch (error) {
        console.log("Error in singleService controller: ", error);
        res.status(500).json((0, Response_1.default)({
            statusCode: 500,
            status: "failed",
            message: "Internal Server Error",
        }));
    }
});
exports.singleService = singleService;
