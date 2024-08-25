import { Router } from "express";

import isValidate from "../../middlewares/auth";
import { createChatList, createMessage, getAllChatForUser, getMessageByChatId } from "./chat.controller";
import upload from "../../middlewares/fileUploadNormal";


const router = Router();

router.post("/chat-create", isValidate, createChatList);
router.get("/get-chat",isValidate, getAllChatForUser);
router.post('/create-message-with-file',isValidate,upload.single('image'),createMessage);
router.get('/get-message/:chatId',isValidate,getMessageByChatId);

export const ChatRoutes = router;