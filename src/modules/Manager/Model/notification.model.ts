import mongoose, { Schema } from "mongoose";
import { INotification } from "../manager.interface";

const notificationSchema: Schema<INotification> = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "MANAGER", "EMPLOYEE", "USER"],
      required: false,
    },
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
