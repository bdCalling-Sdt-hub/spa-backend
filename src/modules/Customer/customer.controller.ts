import { Request, Response } from "express";
import myResponse from "../../utils/Response";
import AppointmentModel from "./customer.model";
import { Types } from "mongoose";
import paginationBuilder from "../../utils/paginationBuilder";
import assignEmployeeModel from "../Manager/Model/employeeAssign.model";
import submitWorkModel from "../Employee/model/submitWork.model";
import { io } from "../../server";
import notificationModel from "../Manager/Model/notification.model";
import userModel from "../User/user.model";
import { populate } from "dotenv";

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
      // customerEmail,
      // customerAddress,
      // customerPhone,
      appointmentDate,
      appointmentNote,
    }: {
      serviceId: Types.ObjectId;
      // customerEmail: string;
      // customerAddress: string;
      // customerPhone: string;
      appointmentDate: Date;
      appointmentNote: string;
    } = req.body;

    console.log(
      serviceId,
      // customerEmail,
      // customerAddress,
      // customerPhone,
      appointmentDate,
      appointmentNote
    );

    if (
      !serviceId ||
      // !customerEmail ||
      // !customerAddress ||
      // !customerPhone ||
      !appointmentDate ||
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
      // customerEmail,
      // customerAddress,
      // customerPhone,
      appointmentDate,
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

    console.log("createAppointment: ", createAppointment);

    const getAdmin = await userModel.findOne({ role: "ADMIN" }) as any;
    console.log("getAdmin: ", getAdmin);
    
    

    const notificationForAdmin = await notificationModel.create({
      message: `${req.user.name} Booked an Service`,
      role: "ADMIN",
      recipientId: getAdmin._id,
    });

    io.emit(`notification::${getAdmin._id}`, notificationForAdmin);



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

const getUserAppointments = async (req: Request, res: Response) => {
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
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const getAppointments = await AppointmentModel.find({
      user: req.userId,
      appointmentStatus: "PENDING",
    })
      .sort({ createdAt: -1 })
      .populate("service user")
      .select("-createdAt -updatedAt -description -__v -image")
      .skip((page - 1) * limit)
      .limit(limit);
    const totalData = await AppointmentModel.countDocuments({
      user: req.userId,
      appointmentStatus: "PENDING",
    });

    const pagination = paginationBuilder({
      totalData,
      limit,
      currentPage: page,
    });

    if (!getAppointments || getAppointments.length === 0) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "No Appointments found",
        })
      );
    }
    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Appointments fetched successfully",
        data: getAppointments,
        pagination,
      })
    );
  } catch (error) {
    console.log("Error in getUserAppointments controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const getOnlyAssignedAppointments = async (req: Request, res: Response) => {
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
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;

    const getAssignAppointmentList = await assignEmployeeModel
      .find({userId: req.userId})
      .populate([
        {
          path: "appointmentId",
          populate: [
            {
              path: "service",
            },
            {
              path: "user",
              match: { _id: req.userId },
            },
          ],
        },

        {
          path: "employeeId",
        },
      ])
      .skip((page - 1) * limit)
      .limit(limit);

    if (!getAssignAppointmentList || getAssignAppointmentList.length === 0) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "No Appointments Assign",
        })
      );
    }

    const totalData = await assignEmployeeModel.countDocuments({userId: req.userId}).populate([
      {
        path: "appointmentId",
        populate: [
          {
            path: "service",
          },
          {
            path: "user",
            match: { _id: req.userId },
          },
        ],
      },

      {
        path: "employeeId",
      },
    ]);

    const pagination = paginationBuilder({
      totalData,
      limit,
      currentPage: page,
    });
    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Appointments fetched successfully",
        data: getAssignAppointmentList,
        pagination,
      })
    );
  } catch (error) {
    console.log("Error in getOnlyAssignedAppointments controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const getSingleAssignedAppointment = async (req: Request, res: Response) => {
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
    const {id} = req.params;

    if(!id){
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "No id found",
        })
      );
    }


    const getAssignAppointmentList = await assignEmployeeModel
      .find({
        _id: id,
      })
      .populate([
        {
          path: "appointmentId",
          populate: [
            {
              path: "service",
            },
            {
              path: "user",
              match: { _id: req.userId },
            },
          ],
        },

        {
          path: "employeeId",
        },
      ]);

    if (!getAssignAppointmentList || getAssignAppointmentList.length === 0) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "No Appointments found",
        })
      );
    }

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Appointments fetched successfully",
        data: getAssignAppointmentList,
      })
    );
  } catch (error) {
    console.log("Error in getSingleAssignedAppointment controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const getWorkSubmissionByUser = async (req: Request, res: Response) => {
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
    const { assignAppointmentId } = req.query;
    if (!assignAppointmentId) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "assignAppointmentId are required",
        })
      );
    }

    const workSubmission = await submitWorkModel
      .findOne({ assignAppointmentId })
      .populate({
        path: "assignAppointmentId",
        populate: [
          {
            path: "employeeId",
           
          },
          
          {
            path: "appointmentId",
            populate: [
              {
                path: "user",
                match: { _id: req.userId },
              },
            ]
          },

          {
            path: "managerId",
          },
        ],
      },
     
      
    
    ).populate({
      path: "inputField.questionId",
      select: "question", // Populate questionId in inputField
      // Select only relevant fields
    })
    .populate({
      path: "checkBoxField.questionId",
      select: "question",  // Populate questionId in checkBoxField
       // Select only relevant fields
    })

    if (!workSubmission) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "work Submission not found",
        })
      );
    }

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Work found successfully",
        data: workSubmission,
      })
    );
  } catch (error) {
    console.log("Error in getWorkSubmissionByUser controller: ", error);
    return res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "error",
        message: "An error occurred while fetching work",
      })
    );
  }
};




export {
  createAppointment,
  getUserAppointments,
  getOnlyAssignedAppointments,
  getSingleAssignedAppointment,
  getWorkSubmissionByUser,
};
