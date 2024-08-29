import { Request, Response } from "express";
import myResponse from "../../utils/Response";
import AppointmentModel from "../Customer/customer.model";


const getAllAppointment = async (req: Request, res: Response) => {
try {
    const userRole = req.userRole;
    if(userRole !== "ADMIN"){
        return res.status(400).json(
            myResponse({
                statusCode: 400,
                status: "failed",
                message: "You are not authorized to access this route",
            })
        )
    }
    const getAllAppointment = await AppointmentModel.find({}).sort({createdAt: -1}).populate("user service"); 

    if(getAllAppointment.length === 0){
        return res.status(400).json(
            myResponse({
                statusCode: 400,
                status: "failed",
                message: "No appointment found",
            })
        )
    }

} catch (error) {
    
}
}