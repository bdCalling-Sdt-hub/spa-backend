import mongoose, { Schema } from "mongoose";
import { IUnableService } from "../employee.interface";

const unableServiceSchema: Schema<IUnableService> = new mongoose.Schema(
  {
    reason: {
      type: String,
      required: true,
    },
    assignAppointmentId: {
      type: Schema.Types.ObjectId,
      ref: "AssignEmployee",
      required: true,
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
   isDeny:{
    type:Boolean,
    default:false
   }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUnableService>(
  "UnableService",
  unableServiceSchema
);
