"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import the 'express' module
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const globalErrorHandler_1 = __importDefault(require("./middlewares/globalErrorHandler"));
const notFound_1 = __importDefault(require("./middlewares/notFound"));
const logger_1 = __importDefault(require("./logger/logger"));
// Create an Express application
const app = (0, express_1.default)();
//parsers
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: true,
    credentials: true
}));
app.use(express_1.default.static("public"));
// app.use("/public", express.static(__dirname + "/public"));
app.use((req, res, next) => {
    logger_1.default.info(`Incoming request: ${req.method} ${req.url}`);
    next();
});
//application router
app.use('/api/v1', routes_1.default);
// Set the port number for the server
// Define a route for the root path ('/')
app.get('/', (req, res) => {
    logger_1.default.info('Root endpoint hit');
    res.send('Hello, This is Ahad Hossaion Aiman from Bangladesh!');
});
app.all('*', notFound_1.default);
app.use(globalErrorHandler_1.default);
// Log errors
app.use((err, req, res, next) => {
    logger_1.default.error(`Error occurred: ${err.message}`, { stack: err.stack });
    next(err);
});
// Start the server and listen on the specified port
exports.default = app;
