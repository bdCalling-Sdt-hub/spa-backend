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
const user_model_1 = __importDefault(require("../modules/User/user.model"));
const emailService_1 = require("./emailService");
const userRegister = (_a) => __awaiter(void 0, [_a], void 0, function* ({ name, email, password, role, }) {
    try {
        const oneTimeCode = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
        try {
            (0, emailService_1.sentOtpByEmail)(email, oneTimeCode);
        }
        catch (error) {
            console.error("Failed to send OTP: ", error);
        }
        if (!oneTimeCode)
            return;
        const user = yield user_model_1.default.create({
            name,
            email,
            role,
            password,
            oneTimeCode,
        });
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                user.oneTimeCode = null;
                yield user.save();
                console.log("oneTimeCode reset to null after 3 minutes");
            }
            catch (error) {
                console.error("Error updating oneTimeCode:", error);
            }
        }), 180000);
        return user; // 3 minutes after otp is sent
    }
    catch (error) {
        console.error("Error in userRegister service:", error);
        throw new Error("Error occurred while registering user");
    }
});
exports.default = userRegister;
