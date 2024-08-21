import mongoose, { Schema } from "mongoose";
import IAppointment from "./customer.interface";

const appointmentSchema: Schema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "Services",
      required: true,
    },
    customerEmail: {
      type: String,
      required: [true, "Email is required"],
      minlength: 3,
      maxlength: 30,
      trim: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: function (v: string) {
          return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(v);
        },
        message: "Please enter a valid Email",
      },
    },
    customerAddress: {
      type: String,
      required: [true, "Address is required"],
      minlength: 3,
      maxlength: 30,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, "Phone is required"],
      minlength: 3,
      trim: true,
    },
    appointmentDate: {
      type: Date,
      required: [true, "Date is required"],
      trim: true,
    },
    appointmentNote: {
      type: String,
      trim: true,
      maxlength: 300,
      required: [true, "Note is required"],
    },
    appointmentStatus: {
      type: String,
      enum: [
        "PENDING",
        "ASSIGN",
        "CHECKED IN",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING",
    },
  },

  {
    timestamps: true,
  }
);

export default mongoose.model<IAppointment>("Appointment", appointmentSchema);
