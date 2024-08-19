import { Types } from "mongoose";


interface IAppointment {
    user: Types.ObjectId;
    service: Types.ObjectId;
    customerEmail: string;
    customerAddress: string;
    customerPhone: string;
    AppointmentDate: Date;
    appointmentNote: string;
    appointmentStatus: "PENDING" | "ASSIGN" | "ON THE WAY" | "CHECKED IN" | "WORKING" | "COMPLETED" | "CANCELLED";
  }
  
  export default IAppointment;