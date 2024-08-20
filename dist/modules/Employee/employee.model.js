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
const createMidnightDate = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0); // Set to 00:00 (midnight)
    return date;
};
const attendanceSchema = new mongoose_1.default.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    checkIn: {
        type: Date,
        required: true,
        default: createMidnightDate, // Default to 00:00 (midnight)
    },
    checkOut: {
        type: Date,
        required: true,
        default: createMidnightDate, // Default to 00:00 (midnight)
    },
    BreakTimeIn: {
        type: Date,
        required: true,
        default: createMidnightDate, // Default to 00:00 (midnight)
    },
    BreakTimeOut: {
        type: Date,
        required: true,
        default: createMidnightDate, // Default to 00:00 (midnight)
    },
    totalWorkingHours: {
        type: Number,
        required: true,
        default: 0,
    },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model("Attendance", attendanceSchema);
