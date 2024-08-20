"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Response = (response = {}) => {
    const responseObject = {
        status: response.status,
        statusCode: response.statusCode,
        message: response.message,
        data: {}
    };
    if (response.type) {
        responseObject.data.type = response.type;
    }
    if (response.data) {
        responseObject.data = response.data;
    }
    if (response.token) {
        responseObject.data.token = response.token;
    }
    if (response.pagination) {
        responseObject.pagination = response.pagination;
    }
    return responseObject;
};
exports.default = Response;
