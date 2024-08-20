import { Types } from "mongoose";

interface IAttendance {
    date: Date;
    userId: Types.ObjectId;
    checkIn: Date;
    checkOut: Date;
    BreakTimeIn: Date;
    BreakTimeOut: Date;
    totalWorkingHours: number;
}

interface IUnableService {
    reason: string;
    assignAppointmentId: Types.ObjectId;
}


export { IAttendance,IUnableService};