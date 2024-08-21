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
    managerId: Types.ObjectId;
    isDeny:boolean;
    employeeId: Types.ObjectId;
}


export { IAttendance,IUnableService};