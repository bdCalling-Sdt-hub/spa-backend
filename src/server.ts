import { Server } from "http";
import mongoose from "mongoose";
import seedSuperAdmin from "./DB";
import app from "./app";
import config from "./config";
import { Server as SocketIo } from "socket.io";
import DailyData from "./modules/Employee/employee.model";
import cron from "node-cron";

let server: Server;

async function main() {
  try {
    await mongoose.connect(config.databaseURL as string);
    seedSuperAdmin();
    server = app.listen(config.port, () => {
      console.log(`Server is running on ${config.port}`);
    });
    const io = new SocketIo(server, {
      cors: {
        origin: "*",
      },
    });
    (global as any).io = io;
  } catch (error) {
    console.log(error);
  }
}

main();

// const createDailyData = async () => {
//   const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

//   const newDailyData = new DailyData({
//     date: new Date(today), // Set today's date
//   });

//   try {
//     const savedData = await newDailyData.save();
//     console.log('New daily data created:', savedData);
//     return savedData;
//   } catch (err) {
//     console.error('Error creating daily data:', err);
//     throw err;
//   }
// };

// // Schedule the task to run every day at midnight
// cron.schedule('0 0 * * *', () => {
//   console.log('Running daily task at midnight');
//   createDailyData().catch(err => {
//     console.error('Failed to create daily data during scheduled task:', err)
//   })
// });

process.on("unhandledRejection", (err) => {
  console.log(`😈 unahandledRejection is detected , shutting down ...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("uncaughtException", () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`);
  process.exit(1);
});
