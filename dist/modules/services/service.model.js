"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const serviceSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        publicFileURL: {
            type: String,
            required: true,
            default: "images/users/service.png"
        },
        path: {
            type: String,
            required: true,
            default: "public\\images\\users\\service.png"
        }
    }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model("Services", serviceSchema);
