"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handlerCastError = (err) => {
    return {
        success: false,
        statusCode: 400,
        message: 'Invalid Id',
        errorMessage: `${err.value} is not a valid ID!`,
        errorDetails: Object.assign({}, err),
    };
};
exports.default = handlerCastError;
