import { Request, Response } from "express";
import userModel from "../User/user.model";
import myResponse from "../../utils/Response";
import chatModel from "./model/chat.model";
import notificationModel from "../Manager/Model/notification.model";
import { io } from "../../server";
import messageModel from "./model/message.model";
import mongoose from "mongoose";
import paginationBuilder from "../../utils/paginationBuilder";

const createChatList = async (req: Request, res: Response) => {
  try {
    const senderId = req.userId;
    const user = await userModel.findOne({ _id: senderId });
    if (!user) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "User not found",
        })
      );
    }

    const { receiverId }: {receiverId: mongoose.Types.ObjectId} = req.body;

    if (!receiverId) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "All fields are required",
        })
      );
    }

    if (senderId === receiverId) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "You cannot send message to yourself",
        })
      );
    }

    const participants = [senderId, receiverId];

    const existingChat = await chatModel.findOne({
      participants: {
        $all: participants,
      },
    });

    if (existingChat) {
      return res.status(409).json(
        myResponse({
          statusCode: 409,
          status: "failed",
          message: "Chat already exists",
        })
      );
    }

    const chatBody = {
      participants,
    };

    const chat = await chatModel.create(chatBody);

    if (chat._id) {
      const welcomeMessage = {
        chatId: chat._id,
        senderId: senderId,
        receiverId: receiverId,
        messageType: "text",
        message: "Welcome to our chat!",
      };
      const createMessage = await messageModel.create(welcomeMessage);

      io.emit(`message::${receiverId}`, createMessage);
    }

    const notificationForReceiver = await notificationModel.create({
      message: `You have a new message From ${user.name}`,
      recipientId: receiverId,
    });

    io.emit(`notification::${receiverId}`, notificationForReceiver);

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Chat created successfully",
        data: chat,
      })
    );
  } catch (error) {
    console.log("create chat error: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal server error",
      })
    );
  }
};

const getAllChatForUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const user = await userModel.findOne({ _id: userId });

    if(!user) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "User not found",
        })
      )
    }

    const chats = await chatModel
      .find({ participants: { $in: [userId] } })
      .populate([
        {
          path: "participants",
        },
        {
          path: "lastMessage",
        }
      ]);
      if(!chats) {
        return res.status(404).json(
          myResponse({
            statusCode: 404,
            status: "failed",
            message: "Chats not found",
          })
        )
      }
      

      res.status(200).json(
        myResponse({
          statusCode: 200,
          status: "success",
          message: "Chats found successfully",
          data: chats
        })
      )


  } catch (error) {
    console.log("Error in get chat controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
}

const getAllChatForAdmin = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if(userRole !== "ADMIN") {
      return res.status(403).json(
        myResponse({
          statusCode: 403,
          status: "failed",
          message: "You are not authorized to access this resource",
        })
      )
    }

    const { id } = req.params;
    console.log(id);

    if(!id) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "user id is required",
        })
      )
    }

    const chats = await chatModel
      .find({ participants: { $in: [id] } })
      .populate([
        {
          path: "participants",
        },
        {
          path: "lastMessage",
        }
      ]);
      if(!chats) {
        return res.status(404).json(
          myResponse({
            statusCode: 404,
            status: "failed",
            message: "Chats not found",
          })
        )
      }
      

      res.status(200).json(
        myResponse({
          statusCode: 200,
          status: "success",
          message: "Chats found successfully",
          data: chats
        })
      )


    
  } catch (error) {
    console.log("Error in get chat controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
}



const createMessage = async (req: Request, res: Response) => {
  try {
    const senderId = req.userId;
    const user = await userModel.findOne({ _id: senderId });
    if (!user) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "User not found",
        })
      );
    }
    const {
      messageType,
      message,
      receiverId,
    }: {
      messageType: string;
      message: string;
      receiverId: mongoose.Types.ObjectId;
    } = req.body;

    if (!messageType || !receiverId) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "All messageType and receiverId are required",
        })
      );
    }

    let image = {};
    if (
      ["image", "video", "audio", "application"].includes(messageType) &&
      req.file
    ) {
      image = {
        publicFileURL: `/images/users/${req.file.filename}`,
        path: `public/images/users/${req.file.filename}`,
      };
    }

    const messageBody: any = {
      senderId: senderId,
      receiverId: receiverId,
      messageType: messageType,
      message: message,
      file: image,
    };

    const participants = [senderId, receiverId];

    const existingChat = await chatModel.findOne({
      participants: {
        $all: participants,
      },
    });

    let chatId;

    if (existingChat) {
      chatId = existingChat._id;
    } else {
      const chatBody = {
        participants,
      };

      const newChat = await chatModel.create(chatBody);
      chatId = newChat._id;
    }

    messageBody.chatId = chatId;

    const messageCreate = await messageModel.create(messageBody);

    // last message
    io.emit(`lastMessage::${chatId}`, messageCreate);

    const chat = await chatModel.findByIdAndUpdate(chatId, {
      lastMessage: messageCreate._id,
    });

    // chat event

    io.emit(`chat::${receiverId}`, chat);

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Message created successfully",
        data: messageCreate,
      })
    );
  } catch (error) {
    console.log("create message error: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal server error",
      })
    );
  }
};

const getMessageByChatId = async (req: Request, res: Response) => {
  try {
    const chatId = req.params.chatId;
    if (!chatId) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "chatId is required",
        })
      );
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const totalMessages = await messageModel.countDocuments({ chatId });

    const getMessage = await messageModel
      .find({ chatId })
      .populate("senderId receiverId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const pagination = paginationBuilder({
      totalData: totalMessages,
      currentPage: page,
      limit,
    });

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Message fetched successfully",
        data: getMessage,
        pagination,
      })
    );
  } catch (error) {
    console.log("getMessageByChatId error: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal server error",
      })
    );
  }
};

export { createChatList, createMessage, getMessageByChatId,getAllChatForUser,getAllChatForAdmin };
