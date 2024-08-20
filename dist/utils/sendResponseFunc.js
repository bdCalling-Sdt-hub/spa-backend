"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendResponseFunc = (res, data) => {
    res.status(data.statusCode).json({
        success: data.success,
        statusCode: data.statusCode,
        message: data === null || data === void 0 ? void 0 : data.message,
        meta: data.pagination,
        data: data.data,
    });
};
