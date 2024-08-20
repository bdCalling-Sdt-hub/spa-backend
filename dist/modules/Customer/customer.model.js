"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const appointmentSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    service: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Services",
        required: true,
    },
    customerEmail: {
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
    customerAddress: {
        type: String,
        required: [true, "Address is required"],
        minlength: 3,
        maxlength: 30,
        trim: true,
    },
    customerPhone: {
        type: String,
        required: [true, "Phone is required"],
        minlength: 3,
        trim: true,
    },
    AppointmentDate: {
        type: Date,
        required: [true, "Date is required"],
        trim: true,
    },
    appointmentNote: {
        type: String,
        trim: true,
        maxlength: 300,
        required: [true, "Note is required"],
    },
    appointmentStatus: {
        type: String,
        enum: [
            "PENDING",
            "ASSIGN",
            "ON THE WAY",
            "CHECKED IN",
            "WORKING",
            "COMPLETED",
            "CANCELLED",
        ],
        default: "PENDING",
    },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model("Appointment", appointmentSchema);
