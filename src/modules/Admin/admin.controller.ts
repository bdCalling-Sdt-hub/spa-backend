import { Request, Response } from "express";
import myResponse from "../../utils/Response";
import AppointmentModel from "../Customer/customer.model";
import paginationBuilder from "../../utils/paginationBuilder";
import userModel from "../User/user.model";
import mongoose from "mongoose";
import chatModel from "../Chat/model/chat.model";
import messageModel from "../Chat/model/message.model";
import attendanceModel from "../Employee/employee.model";

const getAllAppointment = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "ADMIN") {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "You are not authorized to access this route",
        })
      );
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { date } = req.query;
    console.log(new Date(date as string));

    const skip = (page - 1) * limit;

    const totalData = await AppointmentModel.countDocuments(
      (date as string) ? { appointmentDate: new Date(date as string) } : {}
    );
    const getAllAppointment = await AppointmentModel.find(
      (date as string) ? { appointmentDate: new Date(date as string) } : {}
    )
      .sort({ createdAt: -1 })
      .populate("user service")
      .skip(skip)
      .limit(limit);

    const pagination = paginationBuilder({
      totalData,
      limit,
      currentPage: page,
    });

    if (getAllAppointment.length === 0) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "No appointment found",
        })
      );
    }

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Appointment fetched successfully",
        data: getAllAppointment,
        pagination,
      })
    );
  } catch (error) {
    console.log("Error in getAllAppointment controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const getAllEmployeeRequest = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "ADMIN") {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "You are not authorized to access this route",
        })
      );
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;

    const totalData = await userModel.countDocuments({
      role: "EMPLOYEE",
      isEmployee: false,
    });
    const getRequestedEmployee = await userModel
      .find({ role: "EMPLOYEE", isEmployee: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const pagination = paginationBuilder({
      totalData,
      limit,
      currentPage: page,
    });

    if (getRequestedEmployee.length === 0) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "No Employee found",
        })
      );
    }

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Employee fetched successfully",
        data: getRequestedEmployee,
        pagination,
      })
    );
  } catch (error) {
    console.log("Error in getRequestedEmployee controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const acceptOrRejectRequest = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "ADMIN") {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "You are not authorized to access this route",
        })
      );
    }
    const id = req.query.id;
    if (!id) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Invalid id provided",
        })
      );
    }

    const status = req.query.status as string;
    if (status !== "accept" && status !== "deny") {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Invalid status provided status should be accept or reject",
        })
      );
    }

    if (status === "accept") {
      const updateStatus = await userModel.findOne({
        _id: id,
        role: "EMPLOYEE",
      });
      if (!updateStatus) {
        return res.status(400).json(
          myResponse({
            statusCode: 400,
            status: "failed",
            message: "Employee not found",
          })
        );
      }
      updateStatus.isEmployee = true;
      await updateStatus.save();
      return res.status(200).json(
        myResponse({
          statusCode: 200,
          status: "success",
          message: "Employee status updated successfully",
        })
      );
    }

    if (status === "deny") {
      const deleteUser = await userModel.deleteOne({
        _id: id,
        role: "EMPLOYEE",
      });
      if (!deleteUser) {
        return res.status(400).json(
          myResponse({
            statusCode: 400,
            status: "failed",
            message: "Employee not found",
          })
        );
      }

      return res.status(200).json(
        myResponse({
          statusCode: 200,
          status: "success",
          message: "Employee status  successfully",
        })
      );
    }
  } catch (error) {
    console.log("Error in acceptOrRejectRequest controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const getAllManager = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "ADMIN") {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "You are not authorized to access this route",
        })
      );
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;
    const totalData = await userModel.countDocuments(
      search
        ? { role: "MANAGER", name: { $regex: search, $options: "i" } }
        : { role: "MANAGER" }
    );
    const getManager = await userModel
      .find(
        search
          ? { role: "MANAGER", name: { $regex: search, $options: "i" } }
          : { role: "MANAGER" }
      )
      .skip(skip)
      .limit(limit);
    if (getManager.length === 0) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "No Manager found",
        })
      );
    }

    const pagination = paginationBuilder({
      totalData,
      limit,
      currentPage: page,
    });

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Manager fetched successfully",
        data: getManager,
        pagination,
      })
    );
  } catch (error) {
    console.log("Error in getAllManager controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const getSingleManager = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "ADMIN") {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "You are not authorized to access this route",
        })
      );
    }
    const id = req.query.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Invalid id provided",
        })
      );
    }

    const getManager = await userModel.findById(id);
    if (!getManager) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Manager not found",
        })
      );
    }

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Manager fetched successfully",
        data: getManager,
      })
    );
  } catch (error) {
    console.log("Error in getSingleManager controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const getChatListSingleManager = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "ADMIN") {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "You are not authorized to access this route",
        })
      );
    }

    const id = req.query.id as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Invalid id provided",
        })
      );
    }

    const getChatList = await chatModel
      .find({ participants: { $in: [id] } })
      .populate("lastMessage participants")
      .skip(skip)
      .limit(limit);
    const totalData = await chatModel.countDocuments({
      participants: { $in: [id] },
    });

    if (getChatList.length === 0) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "No Chats found",
        })
      );
    }

    const pagination = paginationBuilder({
      totalData,
      limit,
      currentPage: page,
    });

    const result = getChatList.map((item: any) => {
      const receiver = item.participants.find(
        (participant: any) => participant._id.toString() !== id
      );

      return {
        _id: item._id,
        receiver: receiver,
        participants: item.participants,
        unreadCount: item.unreadCount,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        lastMessage: {
          _id: item.lastMessage._id,
          chatId: item.lastMessage.chatId,
          senderId: item.lastMessage.senderId,
          receiverId: item.lastMessage.receiverId,
          messageType: item.lastMessage.messageType,
          message: item.lastMessage.message,
          isDeleted: item.lastMessage.isDeleted,
          createdAt: item.lastMessage.createdAt,
          updatedAt: item.lastMessage.updatedAt,
          file: item.lastMessage.file,
        },
      };
    });

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Chats fetched successfully",
        data: result,
        pagination,
      })
    );
  } catch (error) {
    console.log("Error in getChatListSingleManager controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const getChatMessage = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "ADMIN") {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "You are not authorized to access this route",
        })
      );
    }

    const chatId = req.query.chatId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Invalid chat id provided",
        })
      );
    }

    const totalData = await messageModel.countDocuments({ chatId: chatId });
    const pagination = paginationBuilder({
      totalData,
      limit,
      currentPage: page,
    });
    const getChatMessage = await messageModel
      .find({ chatId: chatId })
      .populate("senderId receiverId")
      .skip(skip)
      .limit(limit);
    if (getChatMessage.length === 0) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "No Messages found",
        })
      );
    }

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Messages fetched successfully",
        data: getChatMessage,
        pagination,
      })
    );
  } catch (error) {
    console.log("Error in getChatMessage controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const getAllUser = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "ADMIN") {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "You are not authorized to access this route",
        })
      );
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const totalData = await userModel.countDocuments({
      role: "USER",
    });
    const getUser = await userModel
      .find({ role: "USER" })
      .skip(skip)
      .limit(limit);
    if (getUser.length === 0) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "No Users found",
        })
      );
    }

    const pagination = paginationBuilder({
      totalData,
      limit,
      currentPage: page,
    });
    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Users fetched successfully",
        data: getUser,
        pagination,
      })
    );
  } catch (error) {
    console.log("Error in getAllUser controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const getAllEmployee = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "ADMIN") {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "You are not authorized to access this route",
        })
      );
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const totalData = await userModel.countDocuments({
      role: "EMPLOYEE",
      isEmployee: true,
    });
    const getManager = await userModel
      .find({ role: "EMPLOYEE", isEmployee: true })
      .skip(skip)
      .limit(limit);
    if (getManager.length === 0) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "No Employees found",
        })
      );
    }

    const pagination = paginationBuilder({
      totalData,
      limit,
      currentPage: page,
    });
    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Managers fetched successfully",
        data: getManager,
        pagination,
      })
    );
  } catch (error) {
    console.log("Error in getAllEmployee controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const getSingleEmployee = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "ADMIN") {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "You are not authorized to access this route",
        })
      );
    }

    const employeeId = req.query.id as string;
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Please provide an employee id",
        })
      );
    }

    const getEmployee = await userModel.findOne({ _id: employeeId });
    if (!getEmployee) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Employee not found",
        })
      );
    }

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Employee fetched successfully",
        data: getEmployee,
      })
    );
  } catch (error) {
    console.log("Error in getSingleEmployee controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const getAllEmployeeAttendance = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "ADMIN") {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "You are not authorized to access this route",
        })
      );
    }

    const date = req.query.date as string;
    console.log(new Date(date));

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const totalData = await attendanceModel.countDocuments();
    const getAttendance = await attendanceModel
      .find(date ? { date: new Date(date) } : {})
      .populate("userId")
      .skip(skip)
      .limit(limit);
    if (getAttendance.length === 0) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "No attendance found",
        })
      );
    }

    const pagination = paginationBuilder({
      totalData,
      limit,
      currentPage: page,
    });
    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Attendance fetched successfully",
        data: getAttendance,
        pagination,
      })
    );
  } catch (error) {
    console.log("Error in getAllEmployeeAttendance controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const completeWorkGraph = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "ADMIN") {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "You are not authorized to access this route",
        })
      );
    }

    let year = req.query.year as any;

    if (!year) {
      const currentDate = new Date();
      year = currentDate.getFullYear().toString();
    }
    console.log(year);
    
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    console.log(startDate, endDate);

    const data = await AppointmentModel.aggregate([
      {
        $match: {
          appointmentStatus: "COMPLETED",
          appointmentDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
    ]);

    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(year , i, 1).toLocaleString("en-us",{
        month: "short"
      });
      // console.log(month);
      
      const total = data.reduce((acc, curr) => {
        const workCompleteMonth = new Date(curr.createdAt).getMonth();
        if (workCompleteMonth === i) {
          return acc + 1;
        } else {
          return acc;
        }
      },0)
      return {name: month, value: total};
    });
    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Data fetched successfully",
        data: monthlyData
      })
    );
  } catch (error) {
    console.log("Error in completeWorkGraph controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};


const adminStatus = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "ADMIN") {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "You are not authorized to access this route",
        })
      );
    }

    const totalWorkDone = await AppointmentModel.countDocuments({
      appointmentStatus: "COMPLETED"});
      
    const totalManager = await userModel.countDocuments({
      role: "MANAGER"});
    
      const totalEmployee = await userModel.countDocuments({
        role: "EMPLOYEE"});

      const  totalPoolCleaning = await AppointmentModel.find().populate([
        {
          path: "service",
          match: { type: "POOL_CLEANING" },
        
        }
      ])
      
      const totalPoolRemodeling = await AppointmentModel.find().populate([
        {
          path: "service",
          match: { type: "POOL_REMODELING" },
        }
      ]) 

      const totalSpa = await AppointmentModel.find().populate([
        {
          path: "service",
          match: { type: "SPA_SERVICE" },
        }
      ])

      
      res.status(200).json(
        myResponse({
          statusCode: 200,
          status: "success",
          message: "Data fetched successfully",
          data: {
            totalWorkDone: totalWorkDone|| 0,
            totalManager : totalManager || 0, 
            totalEmployee: totalEmployee || 0,
            totalPoolCleaning: totalPoolCleaning.length || 0,
            totalPoolRemodeling: totalPoolRemodeling.length || 0,
            totalSpa: totalSpa.length || 0
          }
        })
      );


  } catch (error) {
    console.log("Error in adminStatus controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
}

const recentServiceRequest = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "ADMIN") {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "You are not authorized to access this route",
        })
      );
    }
    const getRecentAppointment = (await AppointmentModel.find().sort({createdAt: -1}).populate("user service")).splice(0,5);
    if(getRecentAppointment.length === 0){
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Data not found",
        })
      );
    }

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Data fetched successfully",
        data: getRecentAppointment
      })
    );
  } catch (error) {
    console.log("Error in recentServiceRequest controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })  
    );
  }
}




export {
  getAllAppointment,
  getAllEmployeeRequest,
  acceptOrRejectRequest,
  getAllManager,
  getSingleManager,
  getChatListSingleManager,
  getChatMessage,
  getAllUser,
  getAllEmployee,
  getSingleEmployee,
  getAllEmployeeAttendance,
  completeWorkGraph,
  adminStatus,
  recentServiceRequest
};