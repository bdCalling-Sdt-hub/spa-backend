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

    const getStatusAssignedAppointment = await employeeAssignModel
      .findOne({ _id: assignAppointmentId, employeeId: req.userId })
      .populate("appointmentId");

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
      inputField,
      checkBoxField,
      workNote,
    });

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

    console.log(images);

    const workSubmission = await submitWorkModel.findByIdAndUpdate(
      workSubmissionId,
      {
        images,
      }
    );

    const getAssignAppointment = await employeeAssignModel.findOne({
      _id: workSubmission?.assignAppointmentId,
      employeeId: req.userId,
    });

    // const notificationForEmployee = await notificationModel.create({
    //   message: `${req.user.name} Checked in successfully`,
    //   role: "USER",
    //   recipientId: createCheckIn.user,
    // });

    // io.emit(`notification::${createCheckIn.user}`, notificationForEmployee);

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
    console.log("============",req.userId);
    console.log("============",req.userRole);
    
    
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
    if(!address) {
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
      path:"",
    }
    let licenceFront = {
      publicFileURL: "",
      path:"",
    };
    let licenceBack = {
      publicFileURL: "",
      path:"",
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
    if(file.image) {
      image = {
        publicFileURL: `images/users/${file.image[0]?.filename}`,
        path: `public\\images\\users\\${file.image[0]?.filename}`,
      } 
      userDetails.image = image
      await userDetails.save()
    }

    if(file.licenceFront) {
      licenceFront = {
        publicFileURL: `images/users/${file.licenceFront[0]?.filename}`,
        path: `public\\images\\users\\${file.licenceFront[0]?.filename}`,
      }
      userDetails.licenceFront = licenceFront
      await userDetails.save()
    }

    if(file.licenceBack) {
      licenceBack = {
        publicFileURL: `images/users/${file.licenceBack[0]?.filename}`,
        path: `public\\images\\users\\${file.licenceBack[0]?.filename}`,
      }
      userDetails.licenceBack = licenceBack
      await userDetails.save()
    }
    
    if(address){
      userDetails.address = address
      await userDetails.save()
    }

 
    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Profile updated successfully",
        data: userDetails,
      })
    )

   
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
}

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
  updateEmployeeProfile
};
