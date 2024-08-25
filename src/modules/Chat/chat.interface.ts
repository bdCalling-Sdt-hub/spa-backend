import mongoose from "mongoose"

interface IChat {
    participants: mongoose.Types.ObjectId[];
    lastMessage?:mongoose.Types.ObjectId;
    unreadCount: number
}


interface IMessage{
    chatId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    messageType: string;
    message: string;
    file?:{
        publicFileURL: string;
        path: string;
    }
    isDeleted?: boolean;
}


export { IChat, IMessage }