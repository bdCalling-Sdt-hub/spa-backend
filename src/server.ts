// import { Server } from "http";
// import mongoose from "mongoose";
// import seedSuperAdmin from "./DB";
// import app from "./app";
// import config from "./config";
// import { Server as SocketIo } from "socket.io";
// import DailyData from "./modules/Employee/employee.model";
// import cron from "node-cron";
// import socketIo from "./sockets/socketIo";

// let server: Server;
// let io: SocketIo;



// async function main() {
//   try {
//     await mongoose.connect(config.databaseURL as string);
//     seedSuperAdmin();
//     server = app.listen(config.port, () => {
//       console.log(`Server is running on ${config.port}`);
//     });
   
//     // (global as any).io = io;
//      io = new SocketIo(server, {
//       cors: {
//         origin: "*",
//       },
//     });

   
//  (global as any).io = io;

//  socketIo(io)
   
//   } catch (error) {
//     console.log(error);
//   }
// }



// main();

// export {io}







// process.on("unhandledRejection", (err) => {
//   console.log(`😈 unahandledRejection is detected , shutting down ...`, err);
//   if (server) {
//     server.close(() => {
//       process.exit(1);
//     });
//   }
//   process.exit(1);
// });

// process.on("uncaughtException", () => {
//   console.log(`😈 uncaughtException is detected , shutting down ...`);
//   process.exit(1);
// });


import { Server } from "http";
import mongoose from "mongoose";
import seedSuperAdmin from "./DB";
import app from "./app";
import config from "./config";
import { Server as SocketIo } from "socket.io";
import cron from "node-cron";
import socketIo from "./sockets/socketIo";

let server: Server;
let io: SocketIo;

async function main() {
  try {
    await mongoose.connect(config.databaseURL as string);
    console.log("Database connected successfully.");

    try {
      await seedSuperAdmin();
      console.log("Super Admin and services seeded successfully.");
    } catch (error) {
      console.error("Error during seed operation:", error);
      process.exit(1);
    }

    server = app.listen(config.port, () => {
      console.log(`Server is running on ${config.port}`);
    });

    io = new SocketIo(server, {
      cors: {
        origin: "*", // Replace * with specific origins in production for security
      },
    });

    (global as any).io = io;

    socketIo(io);

    // Cron job example
    cron.schedule("0 0 * * *", async () => {
      console.log("Running daily cron job...");
      // Your cron job logic here
    });

  } catch (error) {
    console.error("Error during server startup:", error);
    process.exit(1);
  }
}

main();

export { io };

// Graceful shutdown
process.on("unhandledRejection", (err: any) => {
  console.error(`😈 Unhandled rejection detected: ${err.message || err.stack}`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error(`😈 Uncaught exception detected: ${err.message || err.stack}`);
  process.exit(1);
});

process.on("SIGINT", () => {
  console.log("Received SIGINT. Shutting down...");
  if (server) {
    server.close(() => {
      console.log("Server shut down gracefully");
      process.exit(0);
    });
  } else {
    process.exit(1);
  }
});

process.on("SIGTERM", () => {
  console.log("Received SIGTERM. Shutting down...");
  if (server) {
    server.close(() => {
      console.log("Server shut down gracefully");
      process.exit(0);
    });
  } else {
    process.exit(1);
  }
});
