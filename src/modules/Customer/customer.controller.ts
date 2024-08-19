import { Request, Response } from "express";
import myResponse from "../../utils/Response";
import AppointmentModel from "./customer.model";
import { Types } from "mongoose";

const createAppointment = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "USER") {
      return res.status(401).json(
        myResponse({
          statusCode: 401,
          status: "failed",
          message: "You are not authorized to perform this action",
        })
      );
    }
    const {
      serviceId,
      customerEmail,
      customerAddress,
      customerPhone,
      AppointmentDate,
      appointmentNote,
    }:{
      serviceId: Types.ObjectId;
      customerEmail: string;
      customerAddress: string;
      customerPhone: string;
      AppointmentDate: Date;
      appointmentNote: string;
    } = req.body;

    if (
      !serviceId ||
      !customerEmail ||
      !customerAddress ||
      !customerPhone ||
      !AppointmentDate ||
      !appointmentNote
    ) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "All fields are required",
        })
      );
    }

    const createAppointment = await AppointmentModel.create({
      user: req.userId,
      service: serviceId,
      customerEmail,
      customerAddress,
      customerPhone,
      AppointmentDate,
      appointmentNote,
    });

    if (!createAppointment) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Failed to create appointment",
        })
      );
    }

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Appointment created successfully",
        data: createAppointment,
      })
    );
  } catch (error) {
    console.log("Error in createAppointment controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};


export  {createAppointment};