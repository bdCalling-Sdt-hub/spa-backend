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

    const { searchDate, page = 1, limit = 10 } = req.query;

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

    const { assignAppointmentId, reason, managerId, employeeId } = req.body;

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

    const notificationForEmployee = await notificationModel.create({
      message: `${req.user.name} Unable service request created. Reason: ${reason}`,
      role: "MANAGER",
      recipientId: verifyAssignAppointment.managerId,
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
    if(!createCheckIn){
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Appointment CheckIn request Failed",
        })
      )
    }

    const notificationForEmployee = await notificationModel.create({
      message: `${req.user.name} Checked in successfully`,
      role: "USER",
      recipientId: createCheckIn.user,
    });

    io.emit(
      `notification::${createCheckIn.user}`,
      notificationForEmployee
    );

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

export { createAttendance, getAssignAppointment, unableServiceRequest, employeeCheckIn };
