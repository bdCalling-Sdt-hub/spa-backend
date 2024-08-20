"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.generateTokenForLogin = generateTokenForLogin;
const jsonwebtoken_1 = require("jsonwebtoken");
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = __importDefault(require("../config"));
dotenv_1.default.config();
const secret = config_1.default.jwtAccessSecret;
if (!secret)
    throw new Error("JWT_SECRET is not defined");
const expiresInOneHour = 36000;
function generateToken({ id, name, email, role }) {
    return (0, jsonwebtoken_1.sign)({ id, name, email, role }, secret, { expiresIn: expiresInOneHour });
}
function verifyToken(token) {
    try {
        return (0, jsonwebtoken_1.verify)(token, secret);
    }
    catch (error) {
        console.error(error);
        return null;
    }
}
const expiresInOneHourForLogin = 365 * 24 * 60 * 60;
function generateTokenForLogin({ id, name, email, role }) {
    return (0, jsonwebtoken_1.sign)({ id, name, email, role }, secret, { expiresIn: expiresInOneHourForLogin });
}
