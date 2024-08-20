import { Types } from "mongoose";


interface IAssignEmployee {
        managerId: Types.ObjectId;
        employeeId: Types.ObjectId;
        appointmentId: Types.ObjectId;
}

interface INotification {
    message: string;
    role: string;
    recipientId: Types.ObjectId;
    read: boolean;
}
    
export { IAssignEmployee,INotification};