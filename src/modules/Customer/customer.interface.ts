import { Types } from "mongoose";


interface IAppointment {
    user: Types.ObjectId;
    service: Types.ObjectId;
    // customerEmail: string;
    // customerAddress: string;
    // customerPhone: string;
    appointmentDate: Date;
    appointmentNote: string;
    appointmentStatus: "PENDING" | "ASSIGN" | "CHECKED IN" | "WORKING" | "COMPLETED" | "CANCELLED";
  }
  
  export default IAppointment;