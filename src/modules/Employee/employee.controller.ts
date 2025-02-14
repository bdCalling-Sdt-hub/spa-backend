import { Request, Response } from "express";
import myResponse from "../../utils/Response";
import { IAttendance } from "./employee.interface";
import attendanceModel from "./employee.model";
import employeeAssignModel from "../Manager/Model/employeeAssign.model";
import paginationBuilder from "../../utils/paginationBuilder";
import unableServiceModel from "./model/unableService.model";
import notificationModel from "../Manager/Model/notification.model";
import appointmentModel from "../Customer/customer.model";
import { io } from "../../server";
import questionModel from "../services/model/question.model";
import submitWorkModel from "./model/submitWork.model";
import userModel from "../User/user.model";
import { log } from "console";
import { emailWithNodeMailer } from "../../service/notificationByEmail";
import { Types } from "mongoose";


const calculateTotalWorkingHours = (
  attendance: Partial<IAttendance>
): number => {
  const checkInTime = attendance.checkIn
    ? new Date(attendance.checkIn).getTime()
    : 0;
  const checkOutTime = attendance.checkOut
    ? new Date(attendance.checkOut).getTime()
    : 0;
  const breakTimeInTime = attendance.BreakTimeIn
    ? new Date(attendance.BreakTimeIn).getTime()
    : 0;
  const breakTimeOutTime = attendance.BreakTimeOut
    ? new Date(attendance.BreakTimeOut).getTime()
    : 0;

  const workingTime = checkOutTime - checkInTime;
  const breakTime = breakTimeOutTime - breakTimeInTime;

  const totalWorkingTime = workingTime - breakTime;

  return totalWorkingTime > 0 ? totalWorkingTime / (1000 * 60 * 60) : 0; // Convert to hours
};

const createAttendance = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "EMPLOYEE") {
      return res.status(401).json(
        myResponse({
          statusCode: 401,
          status: "failed",
          message: "You are not authorized to perform this action",
        })
      );
    }

    const { status } = req.query;

    // Validate the status
    if (
      status !== "checkIn" &&
      status !== "checkOut" &&
      status !== "BreakTimeIn" &&
      status !== "BreakTimeOut"
    ) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Invalid status",
        })
      );
    }

    const userId = req.userId;
    const today = new Date().toISOString().split("T")[0];

    // Get the current time (only time part, like "10:00 AM")
    const currentTime = new Date();
    const timeOnly = new Date();
    timeOnly.setHours(currentTime.getHours(), currentTime.getMinutes(), 0, 0); // Set hours and minutes, reset seconds and milliseconds

    console.log(timeOnly);

    // Check if the attendance record for today and this user already exists
    const existingAttendance = await attendanceModel.findOne({
      userId,
      date: new Date(today),
    });

    if (existingAttendance) {
      // Update the existing record based on the status
      switch (status) {
        case "checkIn":
          existingAttendance.checkIn = timeOnly;
          break;
        case "checkOut":
          existingAttendance.checkOut = timeOnly;
          break;
        case "BreakTimeIn":
          existingAttendance.BreakTimeIn = timeOnly;
          break;
        case "BreakTimeOut":
          existingAttendance.BreakTimeOut = timeOnly;
          break;
        default:
          break;
      }

      // Calculate the total working hours
      existingAttendance.totalWorkingHours =
        calculateTotalWorkingHours(existingAttendance);
      console.log(existingAttendance.totalWorkingHours);

      await existingAttendance.save();

      return res.status(200).json(
        myResponse({
          statusCode: 200,
          status: "success",
          message: "Attendance updated successfully",
          data: existingAttendance,
        })
      );
    } else {
      // Create a new attendance record and set the relevant field based on status
      const newAttendanceData: Partial<IAttendance> = {
        userId,
        date: new Date(today),
      };

      switch (status) {
        case "checkIn":
          newAttendanceData.checkIn = timeOnly;
          break;
        case "checkOut":
          newAttendanceData.checkOut = timeOnly;
          break;
        case "BreakTimeIn":
          newAttendanceData.BreakTimeIn = timeOnly;
          break;
        case "BreakTimeOut":
          newAttendanceData.BreakTimeOut = timeOnly;
          break;
        default:
          break;
      }

      newAttendanceData.totalWorkingHours =
        calculateTotalWorkingHours(newAttendanceData);

      const newAttendance = new attendanceModel(newAttendanceData);

      await newAttendance.save();

      return res.status(201).json(
        myResponse({
          statusCode: 201,
          status: "success",
          message: "Attendance created successfully",
          data: newAttendance,
        })
      );
    }
  } catch (error) {
    console.log("Error in createAttendance controller: ", error);
    res.status(500).json({
      statusCode: 500,
      status: "failed",
      message: "Internal Server Error",
    });
  }
};

const getAssignAppointment = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    if (userRole !== "EMPLOYEE") {
      return res.status(401).json(
        myResponse({
          statusCode: 401,
          status: "failed",
          message: "You are not authorized to perform this action",
        })
      );
    }

    const {
      searchDate = new Date().toISOString().split("T")[0],
      page = 1,
      limit = 10,
    } = req.query;

    // Calculate skip value for pagination
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    let pipeline: any[] = [
      // Step 1: Match employee assignments
      {
        $match: {
          employeeId: userId,
          isDelete: false,
        },
      },
      // Step 2: Lookup to populate the appointmentId field
      {
        $lookup: {
          from: "appointments", // The name of the appointment collection
          localField: "appointmentId",

          foreignField: "_id",
          as: "appointmentDetails",
        },
      },
      // Step 3: Unwind the appointmentDetails array
      {
        $unwind: "$appointmentDetails",
      },
      {
        $lookup: {
          from: "users",
          localField: "appointmentDetails.user",
          foreignField: "_id",
          as: "appointmentDetails.userDetails",
        },
      },
      // Step 5: Lookup for service details in appointmentDetails
      {
        $lookup: {
          from: "services",
          localField: "appointmentDetails.service",
          foreignField: "_id",
          as: "appointmentDetails.serviceDetails",
        },
      },
    ];

    if (searchDate) {
      // Convert searchDate to a Date object and adjust for start/end of the day
      const search = new Date(searchDate as string);
      const startOfDay = new Date(search.setHours(0, 0, 0, 0));
      const endOfDay = new Date(search.setHours(23, 59, 59, 999));

      console.log(startOfDay, endOfDay, search);

      // Step 4: Add a match stage for the specific AppointmentDate if searchDate is provided
      pipeline.push({
        $match: {
          "appointmentDetails.AppointmentDate": {
            // $gte: startOfDay,
            $lte: endOfDay,
          },
        },
      });
    }

    // Step 5: Sort by createdAt field
    pipeline.push({
      $sort: {
        "appointmentDetails.createdAt": -1, // Sort in descending order
      },
    });

    // Step 6: Populate managerId and employeeId
    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "managerId",
          foreignField: "_id",
          as: "managerDetails",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeDetails",
        },
      },
      // Step 7: Project the final output
      {
        $project: {
          _id: 1,
          managerDetails: { $arrayElemAt: ["$managerDetails", 0] },
          employeeDetails: { $arrayElemAt: ["$employeeDetails", 0] },
          appointmentDetails: 1,
        },
      },
      // Step 8: Apply pagination with skip and limit
      {
        $skip: skip,
      },
      {
        $limit: limitNumber,
      }
    );

    // const appointmentList = await employeeAssignModel.aggregate(pipeline);

    const appointmentList = await employeeAssignModel.aggregate(pipeline);

    if (!appointmentList || appointmentList.length === 0) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "No appointments found",
        })
      );
    }

    const pagination = paginationBuilder({
      totalData: appointmentList.length,
      currentPage: pageNumber,
      limit: limitNumber,
    });

    return res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Appointments fetched successfully",
        data: appointmentList,
        pagination,
      })
    );
  } catch (error) {
    console.log("Error in getAssignAppointment controller: ", error);
    res.status(500).json({
      statusCode: 500,
      status: "failed",
      message: "Internal Server Error",
    });
  }
};

const unableServiceRequest = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "EMPLOYEE") {
      return res.status(401).json(
        myResponse({
          statusCode: 401,
          status: "failed",
          message: "You are not authorized to perform this action",
        })
      );
    }

    interface IUnableService {
      assignAppointmentId: Types.ObjectId;
      reason: string;
      managerId: Types.ObjectId;
      employeeId: Types.ObjectId;
    }

    const { assignAppointmentId, reason, managerId, employeeId }: IUnableService = req.body;

    if (!assignAppointmentId || !reason || !managerId || !employeeId) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "All fields are required",
        })
      );
    }

    const verifyAssignAppointment = await employeeAssignModel.findOne({
      _id: assignAppointmentId,
      employeeId: req.userId,
    });
    if (!verifyAssignAppointment) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "Appointment not found",
        })
      );
    }
    console.log(verifyAssignAppointment);

    const createUnableService = await unableServiceModel.create({
      assignAppointmentId,
      reason,
      managerId: verifyAssignAppointment.managerId,
      employeeId: req.userId,
    });

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Unable service request created successfully",
        data: createUnableService,
      })
    );
    const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Service Request Update</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f7fa;
              color: #333;
              margin: 0;
              padding: 0;
          }
          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
              text-align: center;
              padding: 20px;
              background-color: #4CAF50;
              color: #fff;
              border-radius: 8px 8px 0 0;
          }
          .header h1 {
              font-size: 24px;
              margin: 0;
          }
          .content {
              margin-top: 20px;
              padding: 20px;
              font-size: 16px;
              line-height: 1.5;
              color: #555;
          }
          .content p {
              margin: 10px 0;
          }
          .reason {
              font-weight: bold;
              color: #e74c3c;
          }
          .footer {
              text-align: center;
              margin-top: 30px;
              font-size: 12px;
              color: #888;
          }
          .footer a {
              color: #4CAF50;
              text-decoration: none;
          }
          .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #4CAF50;
              color: #fff;
              font-weight: bold;
              border-radius: 5px;
              text-decoration: none;
              margin-top: 20px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>Service Request Update</h1>
          </div>
          <div class="content">
              <p>Dear <strong>${req.user.name}</strong>,</p>
              <p>We regret to inform you that the service request you attempted to create could not be processed. The reason for this is as follows:</p>
              <p class="reason">${reason}</p>
              <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
              <a href="mailto:support@example.com" class="button">Contact Support</a>
          </div>
         
      </div>
  </body>
  </html>
`;


    const notificationForEmployee = await notificationModel.create({
      message: `${req.user.name} Unable service request created. Reason: ${reason}`,
      role: "MANAGER",
      recipientId: verifyAssignAppointment.managerId,
    });

    emailWithNodeMailer({
          email: `${req.email}`,
          subject: "Unable Service Request",
          html,
        });
    

    io.emit(
      `notification::${verifyAssignAppointment.managerId}`,
      notificationForEmployee
    );
  } catch (error) {
    console.log("Error in unableServiceRequest controller: ", error);
    res.status(500).json({
      statusCode: 500,
      status: "failed",
      message: "Internal Server Error",
    });
  }
};

const employeeCheckIn = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    const userId = req.userId;
    if (userRole !== "EMPLOYEE") {
      return res.status(401).json(
        myResponse({
          statusCode: 401,
          status: "failed",
          message: "You are not authorized to perform this action",
        })
      );
    }

    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "All fields are required",
        })
      );
    }
    const verifyAssignAppointment = await employeeAssignModel.findOne({
      appointmentId: appointmentId,
      employeeId: userId,
    });
    if (!verifyAssignAppointment) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "Appointment not found",
        })
      );
    }

    const createCheckIn = await appointmentModel.findOneAndUpdate(
      { _id: appointmentId },
      {
        appointmentStatus: "CHECKED IN",
      }
    );
    if (!createCheckIn) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Appointment CheckIn request Failed",
        })
      );
    }

    const notificationForEmployee = await notificationModel.create({
      message: `${req.user.name} Checked in successfully`,
      role: "USER",
      recipientId: createCheckIn.user,
    });

    io.emit(`notification::${createCheckIn.user}`, notificationForEmployee);

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Appointment CheckIn request created successfully",
        // data: createCheckIn,
      })
    );
  } catch (error) {
    console.log("Error in employeeCheckIn controller: ", error);
    res.status(500).json({
      statusCode: 500,
      status: "failed",
      message: "Internal Server Error",
    });
  }
};

// work submission

const getInputField = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "EMPLOYEE") {
      return res.status(401).json(
        myResponse({
          statusCode: 401,
          status: "failed",
          message: "You are not authorized to perform this action",
        })
      );
    }
    const { serviceId } = req.query;

    if (!serviceId) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "serviceId are required",
        })
      );
    }

    const inputField = await questionModel.find({
      serviceId: serviceId,
      inputType: "INPUT",
    });

    if (!inputField || inputField.length === 0) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Input Field not found",
        })
      );
    }
    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Input Field found successfully",
        data: inputField,
      })
    );
  } catch (error) {
    console.log("Error in getInputField controller: ", error);
    res.status(500).json({
      statusCode: 500,
      status: "failed",
      message: "Internal Server Error",
    });
  }
};

const getCheckBoxField = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "EMPLOYEE") {
      return res.status(401).json(
        myResponse({
          statusCode: 401,
          status: "failed",
          message: "You are not authorized to perform this action",
        })
      );
    }
    const { serviceId } = req.query;

    if (!serviceId) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "serviceId are required",
        })
      );
    }

    const checkBoxField = await questionModel.find({
      serviceId: serviceId,
      inputType: "CHECKBOX",
    });

    if (!checkBoxField || checkBoxField.length === 0) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "CheckBox Field not found",
        })
      );
    }
    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "CheckBox Field found successfully",
        data: checkBoxField,
      })
    );
  } catch (error) {
    console.log("Error in getCheckBoxField controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const workSubmission = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "EMPLOYEE") {
      return res.status(401).json(
        myResponse({
          statusCode: 401,
          status: "failed",
          message: "You are not authorized to perform this action",
        })
      );
    }

    const { assignAppointmentId, inputField, checkBoxField, workNote } =
      req.body;

  // Parse the inputField and checkBoxField if they are strings
  let parsedInputField;
  let parsedCheckBoxField;

  try {
    parsedInputField = typeof inputField === 'string' ? JSON.parse(inputField) : inputField;
    parsedCheckBoxField = typeof checkBoxField === 'string' ? JSON.parse(checkBoxField) : checkBoxField;
  } catch (error) {
    return res.status(400).json(
      myResponse({
        statusCode: 400,
        status: "failed",
        message: "Invalid JSON format for inputField or checkBoxField",
      })
    );
  }

    // console.log("======>", typeof JSON.parse(inputField));
    // console.log("======>", typeof JSON.parse(checkBoxField));

    // console.log("000000000000000>",{ inputField:JSON.parse(inputField), checkBoxField:JSON.parse(checkBoxField)});

    if (!assignAppointmentId) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "assignAppointmentId are required",
        })
      );
    }

    if (!inputField || inputField.length === 0) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "inputField are required",
        })
      );
    }
    if (!checkBoxField || checkBoxField.length === 0) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "checkBoxField are required",
        })
      );
    }
    // let images = [];
    // if (!req.files?.length || req.files?.length === 0) {
    //   return res.status(400).json(
    //     myResponse({
    //       statusCode: 400,
    //       status: "failed",
    //       message: "images are required",
    //     })
    //   );
    // }

    // const files = req.files as Express.Multer.File[];

    // for (const file of files) {
    //   console.log(file);
    //   images.push({
    //     publicFileURL: `images/users/${file?.filename}`,
    //     path: `public\\images\\users\\${file?.filename}`,
    //   });
    // }

    console.log("getAssignAppointmentId", assignAppointmentId);

    const getStatusAssignedAppointment = await employeeAssignModel
      .findOne({ _id: assignAppointmentId, employeeId: req.userId })
      .populate("appointmentId");

    console.log("getStatusAssignedAppointment: ", getStatusAssignedAppointment);

    if (!getStatusAssignedAppointment) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Appointment not found",
        })
      );
    }

    const appointment = getStatusAssignedAppointment.appointmentId as any;

    if (appointment && appointment?.appointmentStatus !== "CHECKED IN") {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message:
            "You cannot submit work for this appointment as it is not checked in",
        })
      );
    }

    const workSubmission = await submitWorkModel.create({
      assignAppointmentId,
      inputField: inputField,
      checkBoxField: checkBoxField,
      workNote
    });

    console.log("workSubmission: ", workSubmission);

    const getAssignAppointment = await employeeAssignModel.findOne({
      _id: workSubmission?.assignAppointmentId,
      employeeId: req.userId,
    });

    console.log("getAssignAppointment: ", getAssignAppointment);

    if (!getAssignAppointment) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "getAssignAppointment not found",
        })
      );
    }

    const getAppointment = await appointmentModel.findOne({
      _id: getAssignAppointment?.appointmentId,
    });

    console.log("getAppointment: ", getAppointment);

    if (!getAppointment) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "getAppointment not found",
        })
      );
    }

    getAppointment.appointmentStatus = "COMPLETED";
    await getAppointment?.save();

    if (!workSubmission) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "workSubmission not found",
        })
      );
    }

    // Further processing and saving the work submission can be done here.

    return res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Work submitted successfully",
        data: workSubmission,
      })
    );
  } catch (error) {
    console.log("Error in workSubmission controller: ", error);
    return res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "error",
        message: "An error occurred while submitting work",
      })
    );
  }
};

const workUploadPhoto = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "EMPLOYEE") {
      return res.status(401).json(
        myResponse({
          statusCode: 401,
          status: "failed",
          message: "You are not authorized to perform this action",
        })
      );
    }
    const { workSubmissionId } = req.body;
    if (!workSubmissionId) {
      res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "workSubmissionId are required",
        })
      );
    }

    console.log(req.files);

    let images = [];
    if (!req.files?.length || req.files?.length === 0) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "images are required",
        })
      );
    }

    const files = req.files as Express.Multer.File[];

    for (const file of files) {
      console.log(file);
      images.push({
        publicFileURL: `images/users/${file?.filename}`,
        path: `public\\images\\users\\${file?.filename}`,
      });
    }

    console.log("=============>>>>ahad",images);

    const workSubmission = await submitWorkModel.findByIdAndUpdate(
      workSubmissionId,
      {
        images,
      }
    );
log("workSubmission",workSubmission);
    const getAssignAppointment = await employeeAssignModel.findOne({
      _id: workSubmission?.assignAppointmentId,
      employeeId: req.userId,
    });
    console.log("getAssignAppointment",getAssignAppointment);
    

    if (!getAssignAppointment) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Get Assign Appointment not found",
        })
      );
    }

    const getAppointment = await appointmentModel.findOne({
      _id: getAssignAppointment?.appointmentId,
    });

    if (!getAppointment) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "getAppointment not found",
        })
      );
    }

    getAppointment.appointmentStatus = "COMPLETED";
    await getAppointment?.save();

    if (!workSubmission) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "workSubmission not found",
        })
      );
    }

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Work submitted successfully",
        data: workSubmission,
      })
    );
  } catch (error) {
    console.log("Error in workUploadPhoto controller: ", error);
    return res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "error",
        message: "An error occurred while submitting work",
      })
    );
  }
};

const getWorkSubmission = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "EMPLOYEE") {
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
            match: { _id: req.userId },
          },
          {
            path: "appointmentId",
          },

          {
            path: "managerId",
          },
         
        ],
      })
      .populate({
        path: "inputField",
        populate: [
          {
            path: "questionId",
          }
        ],
      },
      
    ).populate({
      path: "checkBoxField",
      populate: [
        {
          path: "questionId",
        }
      ]
    });

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
    console.log("Error in getWorkSubmission controller: ", error);
    return res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "error",
        message: "An error occurred while fetching work",
      })
    );
  }
};

const updateEmployeeProfile = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    console.log("============", req.userId);
    console.log("============", req.userRole);

    if (userRole !== "EMPLOYEE") {
      return res.status(401).json(
        myResponse({
          statusCode: 401,
          status: "failed",
          message: "You are not authorized to perform this action",
        })
      );
    }
    const { address } = req.body;
    if (!address) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "address are required",
        })
      );
    }

    const userDetails = await userModel.findOne({ _id: req.userId });

    if (!userDetails) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "user  not found",
        })
      );
    }

    let image = {
      publicFileURL: "",
      path: "",
    };
    let licenceFront = {
      publicFileURL: "",
      path: "",
    };
    let licenceBack = {
      publicFileURL: "",
      path: "",
    };
    if (!req.files) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Form Data are required",
        })
      );
    }

    const file: any = req.files;
    // for (const file of files) {
    //   console.log(file);
    //   images.push({
    //     publicFileURL: `images/users/${file?.filename}`,
    //     path: `public\\images\\users\\${file?.filename}`,
    //   });
    // }
    if (file.image) {
      image = {
        publicFileURL: `images/users/${file.image[0]?.filename}`,
        path: `public\\images\\users\\${file.image[0]?.filename}`,
      };
      userDetails.image = image;
      await userDetails.save();
    }

    if (file.licenceFront) {
      licenceFront = {
        publicFileURL: `images/users/${file.licenceFront[0]?.filename}`,
        path: `public\\images\\users\\${file.licenceFront[0]?.filename}`,
      };
      userDetails.licenceFront = licenceFront;
      userDetails.isProfileCompleted = true;
      await userDetails.save();
    }

    if (file.licenceBack) {
      licenceBack = {
        publicFileURL: `images/users/${file.licenceBack[0]?.filename}`,
        path: `public\\images\\users\\${file.licenceBack[0]?.filename}`,
      };
      userDetails.licenceBack = licenceBack;
      userDetails.isProfileCompleted = true;
      await userDetails.save();
    }

    if (address) {
      userDetails.address = address;
      userDetails.isProfileCompleted = true;
      await userDetails.save();
    }



    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Profile updated successfully",
        data: userDetails,
      })
    );
  } catch (error) {
    console.log("Error in updateEmployeeProfile controller: ", error);
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
  createAttendance,
  getAssignAppointment,
  unableServiceRequest,
  employeeCheckIn,
  getInputField,
  getCheckBoxField,
  workSubmission,
  workUploadPhoto,
  getWorkSubmission,
  updateEmployeeProfile,
};
