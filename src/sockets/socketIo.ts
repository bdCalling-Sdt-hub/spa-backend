import messageModel from "../modules/Chat/model/message.model";
import chatModel from "../modules/Chat/model/chat.model";
import myResponse from "../utils/Response";

const socketIo = (io: any) => {
  io.on("connection", (socket: any) => {
    console.log(`ID: ${socket.id} just connected`);

    socket.on("send-message",async(data:{message:string,receiverId:string,senderId:string,chatId:string},callback:any)=>{
      try {
        const {message,receiverId,senderId,chatId} = data;
        const messageBody = {
          message,
          messageType: "text",
          senderId,
          receiverId,
          chatId
        }

        const existingChat = await chatModel.findOne({_id:chatId});
        if(!existingChat){
          callback(myResponse(
            {
              statusCode: 404,
              status: "failed",
              message: "Chat not found"
            }
          ))
          return
        }

        const createMessage = await messageModel.create(messageBody);

        const getLastMessage = await messageModel.findOne({
          _id:createMessage._id
        }).populate("senderId").populate("receiverId");
        
        const messageEvent = `lastMessage::${chatId}`;
        io.emit(messageEvent,getLastMessage);

        const chat = await chatModel.findByIdAndUpdate(chatId, {
          lastMessage: createMessage._id
        });

        const chatEvent = `chat::${receiverId}`;
        io.emit(chatEvent,chat);

        if(createMessage){
          callback(myResponse(
            {
              statusCode: 200,
              status: "success",
              message: "Message sent successfully",
              data: getLastMessage
            }
          ))
        }


      } catch (error) {
        console.log("Error in send-message controller socket: ", error);
        callback(myResponse(
          {
            statusCode: 500,
            status: "failed",
            message: "Internal Server Error"
          }
        ))
      }
    })

    socket.on("disconnect", () => {
      console.log(`ID: ${socket.id} disconnected`);
    });
  });
};



export default socketIo