"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        minlength: 3,
        maxlength: 30,
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        minlength: 3,
        maxlength: 30,
        trim: true,
        unique: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v);
            },
            message: "Please enter a valid Email",
        },
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 3,
        set: (v) => bcrypt_1.default.hashSync(v, bcrypt_1.default.genSaltSync(Number(config_1.default.bcryptSaltRounds))),
    },
    dateOfBirth: { type: String, required: false },
    phone: { type: String, required: false },
    address: { type: String, required: false },
    privacyPolicyAccepted: { type: Boolean, default: false, required: false },
    isAdmin: { type: Boolean, default: false },
    isProfileCompleted: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    image: {
        type: Object,
        required: false,
        default: { publicFileURL: "images/users/user.png", path: "public\\images\\users\\user.png" },
    },
    licenceFront: {
        type: Object,
        required: false,
        default: { publicFileURL: "images/users/user.png", path: "public\\images\\users\\user.png" },
    },
    licenceBack: {
        type: Object,
        required: false,
        default: { publicFileURL: "images/users/user.png", path: "public\\images\\users\\user.png" },
    },
    role: { type: String, required: false, enum: ["USER", "EMPLOYEE", "ADMIN", "MANAGER"], default: "ADMIN" },
    oneTimeCode: { type: Number, required: false, default: null },
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.password;
        },
    },
    timestamps: true,
});
exports.default = mongoose_1.default.model("User", userSchema);
