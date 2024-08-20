const socketIo = (io: any) => {
  io.on("connection", (socket: any) => {
    console.log(`ID: ${socket.id} just connected`);

    socket.on("disconnect", () => {
      console.log(`ID: ${socket.id} disconnected`);
    });
  });
};



export default socketIo