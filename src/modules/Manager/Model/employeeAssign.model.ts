import mongoose, { Schema } from "mongoose";
import {IAssignEmployee} from "../manager.interface";



  const assignEmployeeSchema: Schema<IAssignEmployee> = new mongoose.Schema(
    {
      managerId:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      employeeId:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
     appointmentId:{
        type: Schema.Types.ObjectId,
        ref: "Appointment",
        required: true
      },
      isDelete: {
        type: Boolean,
        default: false
      }
    },
    {
      timestamps: true,
    }
  );
  
  export default mongoose.model<IAssignEmployee>("AssignEmployee", assignEmployeeSchema);