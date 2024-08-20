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
const user_model_1 = __importDefault(require("../modules/User/user.model"));
const Response_1 = __importDefault(require("../utils/Response"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwtService_1 = require("../service/jwtService");
const isValidate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            return res.status(401).json((0, Response_1.default)({
                statusCode: 401,
                status: "fail",
                message: "Token is Required",
            }));
        }
        if (!authorization.startsWith("Bearer")) {
            return res.status(400).json((0, Response_1.default)({
                statusCode: 400,
                status: "fail",
                message: "Invalid Token Format",
            }));
        }
        const token = authorization.split(" ")[1];
        let decodedData;
        try {
            decodedData = (0, jwtService_1.verifyToken)(token);
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                return res.status(401).json((0, Response_1.default)({
                    statusCode: 401,
                    status: "fail",
                    message: "Token Expired",
                }));
            }
            else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                return res.status(401).json((0, Response_1.default)({
                    statusCode: 401,
                    status: "fail",
                    message: "Invalid Token",
                }));
            }
            else {
                throw error;
            }
        }
        const user = yield user_model_1.default.findById(decodedData === null || decodedData === void 0 ? void 0 : decodedData.id);
        if (!user) {
            return res.status(401).json((0, Response_1.default)({
                statusCode: 401,
                status: "fail",
                message: "User Not Found",
            }));
        }
        req.user = user;
        req.userId = user._id;
        req.userRole = user.role;
        next();
    }
    catch (error) {
        console.log("IsVerified Middleware Error", error);
        return res.status(500).json((0, Response_1.default)({
            statusCode: 500,
            status: "fail",
            message: "Internal Server Error",
        }));
    }
});
exports.default = isValidate;
