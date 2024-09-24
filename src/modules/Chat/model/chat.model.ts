import mongoose from "mongoose";
import { IChat } from "../chat.interface";


const chatSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    ],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    unreadCount: {
        type: Number,
        default: 0
    },
    
}, {
    timestamps: true
})

export default mongoose.model<IChat>("Chat", chatSchema)