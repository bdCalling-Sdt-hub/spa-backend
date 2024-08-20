"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = require("winston");
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const path_1 = __importDefault(require("path"));
const logger = (0, winston_1.createLogger)({
    level: 'info',
    format: winston_1.format.combine(winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.format.errors({ stack: true }), winston_1.format.splat(), winston_1.format.json()),
    defaultMeta: { service: 'user-service' },
    transports: [
        // Write all logs with level `error` and below to `error.log`
        new winston_daily_rotate_file_1.default({
            filename: path_1.default.join('logs', 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'error',
        }),
        // Write all logs with level `info` and below to `combined.log`
        new winston_daily_rotate_file_1.default({
            filename: path_1.default.join('logs', 'combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
        }),
        // Write logs to the console as well
        new winston_1.transports.Console({
            format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple())
        })
    ],
});
// If we're not in production, log to the `console` with the format: `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston_1.transports.Console({
        format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple())
    }));
}
exports.default = logger;
