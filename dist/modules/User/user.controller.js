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
exports.signIn = exports.setPassword = exports.forgotPassword = exports.resendOtp = exports.verifyCode = exports.signUp = void 0;
const Response_1 = __importDefault(require("../../utils/Response"));
const user_model_1 = __importDefault(require("./user.model"));
const userRegister_1 = __importDefault(require("../../service/userRegister"));
const verifyCodeService_1 = __importDefault(require("../../service/verifyCodeService"));
const emailService_1 = require("../../service/emailService");
const jwtService_1 = require("../../service/jwtService");
const hashPassword_1 = require("../../service/hashPassword");
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, role, } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json((0, Response_1.default)({
                statusCode: 400,
                status: "failed",
                message: "All fields are required",
            }));
        }
        const user = yield user_model_1.default.findOne({ email });
        if (user) {
            return res.status(400).json((0, Response_1.default)({
                statusCode: 400,
                status: "failed",
                message: "User already exists",
            }));
        }
        const userCreate = yield (0, userRegister_1.default)({ name, email, password, role });
        console.log(userCreate);
        res.status(200).json((0, Response_1.default)({
            statusCode: 200,
            status: "success",
            message: "A verification email is sent to your email",
            data: userCreate,
        }));
    }
    catch (error) {
        console.error("Error in signUp controller:", error);
        res.status(500).json((0, Response_1.default)({
            statusCode: 500,
            status: "failed",
            message: "Internal Server Error",
        }));
    }
});
exports.signUp = signUp;
const verifyCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, code } = req.body;
        console.log(email, code);
        const user = yield user_model_1.default.findOne({ email });
        if (!email || !code) {
            return res.status(400).json((0, Response_1.default)({
                statusCode: 404,
                status: "failed",
                message: "All fields are required",
            }));
        }
        if (!user) {
            return res.status(400).json((0, Response_1.default)({
                statusCode: 404,
                status: "failed",
                message: "User not found",
            }));
        }
        const isVerifiedUser = yield (0, verifyCodeService_1.default)(user, code);
        if (isVerifiedUser) {
            const accessToken = (0, jwtService_1.generateToken)({
                email: user.email,
                id: user._id.toString(),
                name: user.name,
                role: user.role,
            });
            res.status(200).json((0, Response_1.default)({
                statusCode: 200,
                status: "success",
                message: "User verified successfully",
                token: accessToken,
            }));
        }
        else {
            return res.status(400).json((0, Response_1.default)({
                statusCode: 400,
                status: "failed",
                message: "Invalid code",
            }));
        }
    }
    catch (error) {
        console.error("Error in verifyCode controller:", error);
        res.status(500).json((0, Response_1.default)({
            statusCode: 500,
            status: "failed",
            message: "Internal Server Error",
        }));
    }
});
exports.verifyCode = verifyCode;
const resendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json((0, Response_1.default)({
                statusCode: 400,
                status: "failed",
                message: "Email are required",
            }));
        }
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json((0, Response_1.default)({
                statusCode: 400,
                status: "failed",
                message: "User not found",
            }));
        }
        // Generate a new OTP
        const oneTimeCode = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
        if (user.oneTimeCode === null) {
            return res.status(400).json((0, Response_1.default)({
                statusCode: 400,
                status: "failed",
                message: "OTP already sent",
            }));
        }
        user.oneTimeCode = oneTimeCode;
        yield user.save();
        yield (0, emailService_1.sentOtpByEmail)(email, oneTimeCode);
        res.status(200).json((0, Response_1.default)({
            statusCode: 200,
            status: "success",
            message: "OTP has been resent successfully",
        }));
    }
    catch (error) {
        console.error("Error resending OTP:", error);
        res.status(500).json((0, Response_1.default)({
            statusCode: 500,
            status: "Failed",
            message: "Failed to resend OTP",
        }));
    }
});
exports.resendOtp = resendOtp;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json((0, Response_1.default)({
                statusCode: 400,
                status: "failed",
                message: "Email are required",
            }));
        }
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json((0, Response_1.default)({
                statusCode: 400,
                status: "failed",
                message: "User not found",
            }));
        }
        const oneTimeCode = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
        try {
            (0, emailService_1.sentOtpByEmail)(email, oneTimeCode);
        }
        catch (error) {
            console.error("Failed to send verification email", error);
            throw new Error("Error creating user");
        }
        user.oneTimeCode = oneTimeCode;
        yield user.save();
        res.status(200).json((0, Response_1.default)({
            statusCode: 200,
            status: "success",
            message: "A verification code is sent to your email",
        }));
    }
    catch (error) {
        console.error("Error in forgotPassword controller:", error);
        res.status(500).json((0, Response_1.default)({
            statusCode: 500,
            message: `Internal server error ${error.message}`,
            status: "Failed",
        }));
    }
});
exports.forgotPassword = forgotPassword;
const setPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json((0, Response_1.default)({
                statusCode: 400,
                status: "failed",
                message: "Token or password are required",
            }));
        }
        const userData = (0, jwtService_1.verifyToken)(token);
        if (!userData) {
            return res.status(400).json((0, Response_1.default)({
                statusCode: 400,
                status: "failed",
                message: "Invalid token",
            }));
        }
        const expireDate = new Date(userData.exp * 1000);
        if (expireDate < new Date()) {
            return res.status(400).json((0, Response_1.default)({
                statusCode: 400,
                status: "failed",
                message: "Token expired",
            }));
        }
        const user = yield user_model_1.default.findOne({ _id: userData.id });
        if (!user) {
            return res.status(400).json((0, Response_1.default)({
                statusCode: 400,
                status: "failed",
                message: "User not found",
            }));
        }
        user.password = password;
        yield user.save();
        res.status(200).json((0, Response_1.default)({
            statusCode: 200,
            status: "success",
            message: "Password has been set successfully",
        }));
    }
    catch (error) {
        console.error("Error in setPassword controller:", error);
        res.status(500).json((0, Response_1.default)({
            statusCode: 500,
            message: `Internal server error ${error.message}`,
            status: "Failed",
        }));
    }
});
exports.setPassword = setPassword;
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json((0, Response_1.default)({
                statusCode: 404,
                status: "failed",
                message: "User not found",
            }));
        }
        if (!user.isVerified) {
            return res.status(401).json((0, Response_1.default)({
                statusCode: 401,
                status: "failed",
                message: "Please verify your account",
            }));
        }
        const isPasswordMatch = yield (0, hashPassword_1.comparePassword)(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json((0, Response_1.default)({
                statusCode: 401,
                status: "failed",
                message: "Incorrect password",
            }));
        }
        const accessToken = (0, jwtService_1.generateTokenForLogin)({
            email: user.email,
            id: user._id.toString(),
            name: user.name,
            role: user.role,
        });
        if (!accessToken) {
            return res.status(500).json((0, Response_1.default)({
                statusCode: 500,
                status: "failed",
                message: "Failed to generate access token",
            }));
        }
        res.status(200).json((0, Response_1.default)({
            statusCode: 200,
            status: "success",
            message: "Login successful",
            data: user,
            token: accessToken,
        }));
    }
    catch (error) {
        console.log("Error in signIn controller: ", error);
        res.status(500).json((0, Response_1.default)({
            statusCode: 500,
            status: "failed",
            message: "Internal server error",
        }));
    }
});
exports.signIn = signIn;
