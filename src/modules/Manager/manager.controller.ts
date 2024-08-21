import { Request, Response } from "express";
import myResponse from "../../utils/Response";
import userModel from "../User/user.model";
import paginationBuilder from "../../utils/paginationBuilder";
import serviceModel from "../services/service.model";
import AppointmentModel from "../Customer/customer.model";
import assignEmployeeModel from "../Manager/Model/employeeAssign.model";
import notificationModel from "./Model/notification.model";
import { io } from "../../server";
import unableServiceModel from "../Employee/model/unableService.model";

const createManager = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "ADMIN") {
      return res.status(403).json({
        statusCode: 403,
        status: "failed",
        message: "You are not authorized to perform this action",
      });
    }

    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "All fields are required",
        })
      );
    }
    const user = await userModel.create({
      name,
      email,
      role: "MANAGER",
      password,
      isVerified: true,
    });

    return res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Manager created successfully",
        data: user,
      })
    );
  } catch (error) {
    console.log("Error in createManager controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const getCustomers = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "MANAGER") {
      return res.status(403).json({
        statusCode: 403,
        status: "failed",
        message: "You are not authorized to perform this action",
      });
    }

    // Get pagination parameters from query, with default values
    const currentPage = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Calculate the number of documents to skip
    const skip = (currentPage - 1) * limit;

    // Get the search query parameter
    const search = req.query.search as string;

    // Build the query object for filtering
    const query: any = { role: "USER" };

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { email: { $regex: new RegExp(search, "i") } },
      ];
    }

    // Fetch total customer count and customers for the current page
    const totalData = await userModel.countDocuments(query);
    const customers = await userModel.find(query).skip(skip).limit(limit);

    if (!customers || customers.length === 0) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "No customers found",
        })
      );
    }

    // Use paginationBuilder to get pagination details
    const pagination = paginationBuilder({
      totalData,
      currentPage,
      limit,
    });

    return res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Customers fetched successfully",
        data: customers,
        pagination,
      })
    );
  } catch (error) {
    console.log("Error in getCustomers controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const getSingleCustomer = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "MANAGER") {
      return res.status(403).json({
        statusCode: 403,
        status: "failed",
        message: "You are not authorized to perform this action",
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Customer ID is required",
        })
      );
    }

    const customer = await userModel.findById(id);

    if (!customer) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "Customer not found",
        })
      );
    }

    return res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Customer fetched successfully",
        data: customer,
      })
    );
  } catch (error) {
    console.log("Error in getSingleCustomer controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const getEmployees = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "MANAGER") {
      return res.status(403).json({
        statusCode: 403,
        status: "failed",
        message: "You are not authorized to perform this action",
      });
    }

    // Get pagination parameters from query, with default values
    const currentPage = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Calculate the number of documents to skip
    const skip = (currentPage - 1) * limit;

    const search = req.query.search as string;

    // Build the query object for filtering
    const query: any = { role: "EMPLOYEE" };

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { email: { $regex: new RegExp(search, "i") } },
      ];
    }

    console.log("query: ", search);
    // Fetch total customer count and customers for the current page
    const totalData = await userModel.countDocuments(query);
    const employee = await userModel.find(query).skip(skip).limit(limit);

    if (!employee || employee.length === 0) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "No employee found",
        })
      );
    }

    // Use paginationBuilder to get pagination details
    const pagination = paginationBuilder({
      totalData,
      currentPage,
      limit,
    });

    return res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Employee fetched successfully",
        data: employee,
        pagination,
      })
    );
  } catch (error) {
    console.log("Error in getEmployees controller: ", error);
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
    if (userRole !== "MANAGER") {
      return res.status(403).json({
        statusCode: 403,
        status: "failed",
        message: "You are not authorized to perform this action",
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Employee ID is required",
        })
      );
    }

    const employee = await userModel.findById(id);

    if (!employee) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "Employee Details not found",
        })
      );
    }

    return res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Employee Details fetched successfully",
        data: employee,
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

const getService = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json(
        myResponse({
          statusCode: 401,
          status: "failed",
          message: "You are not authorized to perform this action",
        })
      );
    }

    const service = await serviceModel.find();
    if (!service || service.length === 0) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "No service found",
        })
      );
    }

    return res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Service fetched successfully",
        data: service,
      })
    );
  } catch (error) {
    console.log("Error in getService controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const getAppointmentRequest = async (req: Request, res: Response) => {
  try {
    const user = req.userRole;
    if (user !== "MANAGER") {
      return res.status(403).json(
        myResponse({
          statusCode: 403,
          status: "failed",
          message: "You are not authorized to perform this action",
        })
      );
    }

    // Get pagination parameters from query, with default values
    const currentPage = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Calculate the number of documents to skip
    const skip = (currentPage - 1) * limit;

    const { id } = req.params;
    const totalData = await AppointmentModel.countDocuments({ service: id });
    const getAppointmentRequest = await AppointmentModel.find({
      service: id,
      appointmentStatus: "PENDING",
    })
      .skip(skip)
      .limit(limit)
      .populate("service user");
    if (!getAppointmentRequest || getAppointmentRequest.length === 0) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "Appointment request not found",
        })
      );
    }
    // Use paginationBuilder to get pagination details
    const pagination = paginationBuilder({
      totalData,
      currentPage,
      limit,
    });

    return res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Appointment request fetched successfully",
        data: getAppointmentRequest,
        pagination,
      })
    );
  } catch (error) {
    console.log("Error in getAppointmentRequest controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const assignEmployee = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    const userId = req.userId;
    if (userRole !== "MANAGER") {
      return res.status(403).json(
        myResponse({
          statusCode: 403,
          status: "failed",
          message: "You are not authorized to perform this action",
        })
      );
    }

    const { employeeId, appointmentId } = req.body;
    if (!employeeId || !appointmentId) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "All fields are required",
        })
      );
    }

    const assignEmployee = await assignEmployeeModel.create({
      managerId: userId,
      employeeId,
      appointmentId,
    });

    if (!assignEmployee) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Failed to assign employee",
        })
      );
    }

    const updateAppointmentStatus = await AppointmentModel.findByIdAndUpdate(
      appointmentId,
      { status: "ASSIGNED" },
      { new: true }
    );

    if (!updateAppointmentStatus) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Failed to update appointment status",
        })
      );
    }

    const employeeName = await userModel.findById(employeeId).select("name");

    if (!employeeName) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Failed to fetch employee name",
        })
      );
    }

    const notificationForEmployee = await notificationModel.create({
      message: `${req.user.name} appointment has been assigned to ${employeeName.name}`,
      role: "EMPLOYEE",
      recipientId: employeeId,
    });

    io.emit(`notification::${employeeId}`, notificationForEmployee);
    // console.log(socket);

    return res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Employee assigned successfully",
        data: assignEmployee,
      })
    );
  } catch (error) {
    console.log("Error in AssignEmployee controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const getUnableServiceRequest = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    const userId = req.userId;
    console.log(userId);

    if (userRole !== "MANAGER") {
      return res.status(403).json(
        myResponse({
          statusCode: 403,
          status: "failed",
          message: "You are not authorized to perform this action",
        })
      );
    }

    const getUnableServiceRequestList = await unableServiceModel
      .find({
        managerId: userId,
        isDeny: false,
      })
      .populate({
        path: "assignAppointmentId",
        populate: [
          {
            path: "managerId",
          },
          {
            path: "employeeId",
          },
          {
            path: "appointmentId",
          },
        ],
      });

    if (
      !getUnableServiceRequestList ||
      getUnableServiceRequestList.length === 0
    ) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "Unable service request not found",
        })
      );
    }

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Unable service request fetched successfully",
        data: getUnableServiceRequestList,
      })
    );
  } catch (error) {
    console.log("Error in getUnableServiceRequest controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const unableServiceStatus = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "MANAGER") {
      return res.status(403).json(
        myResponse({
          statusCode: 403,
          status: "failed",
          message: "You are not authorized to perform this action",
        })
      );
    }
    const { status }: { status: string } = req.body;
    const { id } = req.query;
    console.log(status, id);

    if (!id) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Please provide Unable service id",
        })
      );
    }

    if (!status) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "All fields are required",
        })
      );
    }
    if (status === "deny") {
      const updateUnableService = await unableServiceModel.findByIdAndUpdate(
        id,
        {
          isDeny: true,
        }
      );

      if (!updateUnableService) {
        return res.status(404).json(
          myResponse({
            statusCode: 404,
            status: "failed",
            message: "Unable service request Failed",
          })
        );
      }

      const notificationForEmployee = await notificationModel.create({
        message: `Unable service request has been denied`,
        role: "EMPLOYEE",
        recipientId: updateUnableService.employeeId,
      });
      io.emit(
        `notification::${updateUnableService.employeeId}`,
        notificationForEmployee
      );

      res.status(200).json(
        myResponse({
          statusCode: 200,
          status: "success",
          message: "Unable service request denied successfully",
          data: updateUnableService,
        })
      );
    }

    if (status === "approve") {
      const getUnableService = await unableServiceModel.findById(id);

      if (!getUnableService) {
        return res.status(404).json(
          myResponse({
            statusCode: 404,
            status: "failed",
            message: "Unable service request Failed",
          })
        );
      }

      console.log(getUnableService.assignAppointmentId);
      
      const softDeleteAssignAppointment =
        await assignEmployeeModel.findByIdAndUpdate(
          getUnableService.assignAppointmentId._id,
          {
            isDelete: true,
          }
        );
        console.log(softDeleteAssignAppointment);
        

      if (!softDeleteAssignAppointment) {
        return res.status(404).json(
          myResponse({
            statusCode: 404,
            status: "failed",
            message: "Unable service request Failed",
          })
        );
      }

      const notificationForEmployee = await notificationModel.create({
        message: `Unable service request has been denied`,
        role: "EMPLOYEE",
        recipientId: getUnableService.employeeId,
      });
      io.emit(
        `notification::${getUnableService.employeeId}`,
        notificationForEmployee
      );

      res.status(200).json(
        myResponse({
          statusCode: 200,
          status: "success",
          message: "Unable service request approved successfully",
          data: softDeleteAssignAppointment,
        })
      );
    }
  } catch (error) {
    console.log("Error in unableServiceStatus controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

export {
  createManager,
  getCustomers,
  getSingleCustomer,
  getEmployees,
  getSingleEmployee,
  getService,
  getAppointmentRequest,
  assignEmployee,
  getUnableServiceRequest,
  unableServiceStatus
};
