"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handlerZodError = (err) => {
    const errorMessageArray = err.issues.map((issue) => issue.path[issue.path.length - 1] +
        ' is ' +
        issue.message.split(',')[0].toLowerCase());
    return {
        success: false,
        statusCode: 400,
        message: 'Validation Error',
        errorMessage: errorMessageArray.join('. '),
        errorDetails: Object.assign({}, err),
    };
};
exports.default = handlerZodError;
