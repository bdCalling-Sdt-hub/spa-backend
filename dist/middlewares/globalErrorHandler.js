"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const handleZodError_1 = __importDefault(require("../errors/handleZodError"));
const mongoose_1 = __importDefault(require("mongoose"));
const handleValidationError_1 = __importDefault(require("../errors/handleValidationError"));
const handleCastError_1 = __importDefault(require("../errors/handleCastError"));
const handleDuplicateError_1 = __importDefault(require("../errors/handleDuplicateError"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const config_1 = __importDefault(require("../config"));
const globalErrorHandler = (error, req, res, next) => {
    let errorInfo = {
        success: false,
        statusCode: 400,
        message: 'Invalid Request',
        errorMessage: '',
        errorDetails: {
            path: null,
            value: null,
        },
    };
    if (error instanceof zod_1.ZodError) {
        errorInfo = (0, handleZodError_1.default)(error);
    }
    else if (error instanceof mongoose_1.default.Error.ValidationError) {
        errorInfo = (0, handleValidationError_1.default)(error);
    }
    else if (error instanceof mongoose_1.default.Error.CastError) {
        errorInfo = (0, handleCastError_1.default)(error);
    }
    else if ((error === null || error === void 0 ? void 0 : error.code) === 11000) {
        errorInfo = (0, handleDuplicateError_1.default)(error);
    }
    else if (error instanceof Error) {
        errorInfo.errorMessage = error.message;
    }
    else if (error instanceof AppError_1.default) {
        errorInfo.statusCode = error.statusCode;
        errorInfo.errorMessage = error.message;
    }
    return res.status(500).json({
        success: errorInfo.success,
        statusCode: errorInfo.statusCode,
        message: errorInfo.message,
        errorMessage: errorInfo.errorMessage,
        errorDetails: errorInfo.errorDetails,
        stack: config_1.default.node_env === 'development' ? error.stack : null
    });
};
exports.default = globalErrorHandler;
