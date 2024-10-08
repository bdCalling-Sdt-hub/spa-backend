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
Object.defineProperty(exports, "__esModule", { value: true });
const verifyCodeService = (user, code) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (user.oneTimeCode === code) {
            user.isVerified = true;
            yield user.save();
            setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                user.oneTimeCode = null;
                yield user.save();
                console.log("oneTimeCode reset to null after 3 minutes");
            }), 1000);
            return true;
        }
        else {
            return false;
        }
    }
    catch (error) {
        console.error("Error in verifyCode service:", error);
        throw new Error("Error occurred while verifying code");
    }
});
exports.default = verifyCodeService;
