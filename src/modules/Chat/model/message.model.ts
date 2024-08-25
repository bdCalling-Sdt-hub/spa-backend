import mongoose from "mongoose";
import { IMessage } from "../chat.interface";


const messageSchema = new mongoose.Schema<IMessage>({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    messageType: {
        type: String,
        required: true,
        enum: ['image', 'application', 'audio', 'video', 'unknown', 'text'],
    },
    message: {
        type: String,
        required: true
    },
    file: {
        publicFileURL: { type: String, default: null }, // Defaults to null
        path: { type: String, default: null }, // Defaults to null
      },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
})

export default mongoose.model<IMessage>("Message", messageSchema)