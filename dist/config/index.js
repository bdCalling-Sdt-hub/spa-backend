"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({
    path: path_1.default.join((process.cwd(), '.env'))
});
exports.default = {
    port: process.env.PORT || 5000, // Use the port from .env or default to 5000
    databaseURL: process.env.MONGODB_CONNECTION, // Use the MongoDB connection string from .env or default to another database
    uploadFolder: process.env.UPLOAD_FOLDER, // Use the upload folder from .env or default to 'public/images'
    maxFileSize: process.env.MAX_FILE_SIZE || 5242880, // Use the max file size from .env or default to 5MB
    allowedFileTypes: ((_a = process.env.ALLOWED_FILE_TYPES) === null || _a === void 0 ? void 0 : _a.split(',')) || ['jpg', 'jpeg', 'png'], // Use the allowed file types from .env or default to jpg, jpeg, png
    smtpUsername: process.env.SMTP_USERNAME || '', // Use the SMTP username from .env
    smtpPassword: process.env.SMTP_PASSWORD || '', // Use the SMTP password from .env
    jwtSecretKey: process.env.JWT_SECRET_KEY || 'default_jwt_secret', // Use the JWT secret key from .env or default
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'default_access_secret', // Use the JWT access secret key from .env or default
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret', // Use the JWT refresh secret key from .env or default
    jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1d', // Use the JWT access expiration from .env or default to 1 day
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d', // Use the JWT refresh expiration from .env or default to 30 days
    bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS, // Use the bcrypt salt rounds from .env or default to 10
    defaultPassword: process.env.DEFAULT_PASS || 'default_pass', // Use the default password from .env or default
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '', // Use the Stripe secret key from .env
    superAdminPassword: process.env.SUPER_ADMIN_PASSWORD || 'default_super_admin_password', // Use the super admin password from .env or default
    apiResponseLanguage: process.env.API_RESPONCE_LANGUAGE || 'en',
    node_env: process.env.NODE_ENV || 'development' // Use the API response language from .env or default to English
};
