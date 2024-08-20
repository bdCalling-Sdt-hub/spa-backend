import mongoose, { Schema } from "mongoose";
import {IAttendance} from "./employee.interface";

const createMidnightDate = (): Date => {
    const date = new Date();
    date.setHours(0, 0, 0, 0); // Set to 00:00 (midnight)
    return date;
  };

  const attendanceSchema: Schema<IAttendance> = new mongoose.Schema(
    {
      date: {
        type: Date,
        required: true,
        default: Date.now,
      },
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
      },
      checkIn: {
        type: Date,
        required: true,
        default: createMidnightDate, // Default to 00:00 (midnight)
      },
      checkOut: {
        type: Date,
        required: true,
        default: createMidnightDate, // Default to 00:00 (midnight)
      },
      BreakTimeIn: {
        type: Date,
        required: true,
        default: createMidnightDate, // Default to 00:00 (midnight)
      },
      BreakTimeOut: {
        type: Date,
        required: true,
        default: createMidnightDate, // Default to 00:00 (midnight)
      },
      totalWorkingHours: {
        type: Number,
        required: true,
        default: 0,
      },
    },
    {
      timestamps: true,
    }
  );
  
  export default mongoose.model<IAttendance>("Attendance", attendanceSchema);
