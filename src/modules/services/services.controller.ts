import { Request, Response } from "express";
import serviceModel from "./service.model";
import myResponse from "../../utils/Response";
import IService from "./services.interface";
import employeeSubmitFormServiceModel from "./employeeSubmitFormService.model";
import questionModel from "./model/question.model";

const createService = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    console.log("userRole: ", userRole);

    if (userRole !== "ADMIN") {
      return res.status(403).json({
        statusCode: 403,
        status: "failed",
        message: "Toy don't have permission to perform this action",
      });
    }

    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({
        statusCode: 400,
        status: "failed",
        message: "All fields are required",
      });
    }

    let image = {};

    if (req.file) {
      image = {
        publicFileURL: `images/users/${req.file?.filename}`,
        path: `public\\images\\users\\${req.file?.filename}`,
      };
    }
    const createService = await serviceModel.create({
      name,
      description,
      image,
      type: "OTHERS",
    });

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Service created successfully",
        data: createService,
      })
    );
  } catch (error) {
    console.log("Error in createService controller: ", error);
    res.status(500).json({
      statusCode: 500,
      status: "failed",
      message: "Internal Server Error",
    });
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
    const service = await serviceModel.find({isDelete: false});
    if (!service) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "Service not found",
        })
      );
    }
    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Service fetched successfully",
        data: service,
      })
    );
  } catch (error) {
    console.log("Error in getService controller: ", error);
    res.status(500).json({
      statusCode: 500,
      status: "failed",
      message: "Internal Server Error",
    });
  }
};

const updateService = async (req: Request, res: Response) => {
  try {
    const user = req.userRole;
    if (user !== "ADMIN") {
      return res.status(401).json(
        myResponse({
          statusCode: 401,
          status: "failed",
          message: "You are not authorized to perform this action",
        })
      );
    }

    const { id } = req.query;
    if (!id) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "Service Id not found",
        })
      );
    }

    const service = await serviceModel.findById(req.query.id);
    if (!service) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "Service not found",
        })
      );
    }

    const { name, description } = req.body;

    let image;

    if (req.file) {
      image = {
        publicFileURL: `images/users/${req.file?.filename}`,
        path: `public\\images\\users\\${req.file?.filename}`,
      };
    }

    if (name) {
      service.name = name;
      await service.save();
    }

    if (description) {
      service.description = description;
      await service.save();
    }

    if (image) {
      service.image = image;
      await service.save();
    }

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Service updated successfully",
        data: service,
      })
    );
  } catch (error) {
    console.log("Error in updateService controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const deleteService = async (req: Request, res: Response) => {
  try {
    const user = req.userRole;
    if (user !== "ADMIN") {
      return res.status(401).json(
        myResponse({
          statusCode: 401,
          status: "failed",
          message: "You are not authorized to perform this action",
        })
      );
    }
    const { id } = req.body;
    console.log(id);
    if (!id) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "Service Id not found",
        })
      );
    }

    const service = await serviceModel.findById(id);
    console.log(service);

    if (!service) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "Service not found",
        })
      );
    }
    console.log(service);
    service.isDelete = true;
    await service.save();

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Service deleted successfully",
        data: service,
      })
    );
  } catch (error) {
    console.log("Error in deleteService controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const singleService = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "Service Id not found",
        })
      );
    }
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
    console.log(id);

    const service = await serviceModel.findById(id);
    if (!service) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "Service not found",
        })
      );
    }

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Service fetched successfully",
        data: service,
      })
    );
  } catch (error) {
    console.log("Error in singleService controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const employeeSubmitFormService = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;
    if (userRole !== "ADMIN") {
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
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "Service Id not found",
        })
      );
    }

    const { chemicalList, serviceProviderList } = req.body;
    if (!chemicalList || !serviceProviderList) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "Please provide all the required fields",
        })
      );
    }

    const createAndUpdateEmployeeSubmitFormService =
      await employeeSubmitFormServiceModel.create({
        serviceId: serviceId,
        chemicalList: chemicalList,
        providerList: serviceProviderList,
      });

    // Create question collection for chemicalList
    for (const chemical of chemicalList.chemical) {
      await questionModel.create({
        serviceId: serviceId,
        question: chemical,
        questionValue: chemical
          .toLowerCase()
          .replace(/ /g, "_")
          .replace(/[()]/g, ""),
        inputType: chemicalList.inputType,
      });
    }

    // Create question collection for providerList
    for (const provider of serviceProviderList.provider) {
      await questionModel.create({
        serviceId: serviceId,
        question: provider,
        questionValue: provider
          .toLowerCase()
          .replace(/ /g, "_")
          .replace(/[()]/g, ""),
        inputType: serviceProviderList.inputType,
      });
    }

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Service created successfully",
        data: createAndUpdateEmployeeSubmitFormService,
      })
    );
  } catch (error) {
    console.log("Error in employeeSubmitFormService controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const updateEmployeeSubmitFormService = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;

    // Check if user is ADMIN
    if (userRole !== "ADMIN") {
      return res.status(401).json(
        myResponse({
          statusCode: 401,
          status: "failed",
          message: "You are not authorized to perform this action",
        })
      );
    }

    // Check if serviceId is provided
    const { serviceId } = req.query;
    if (!serviceId) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "Service Id not found",
        })
      );
    }

    // Validate request body
    const { chemicalList, serviceProviderList } = req.body;
    console.log(chemicalList, serviceProviderList);

    if (!chemicalList || !serviceProviderList) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "Please provide all the required fields",
        })
      );
    }

    // Fetch the existing service
    const existingService = await employeeSubmitFormServiceModel.findOne({
      serviceId,
    });

    if (!existingService) {
      const createAndUpdateEmployeeSubmitFormService =
        await employeeSubmitFormServiceModel.create({
          serviceId: serviceId,
          chemicalList: chemicalList,
          providerList: serviceProviderList,
        });

      // Create question collection for chemicalList
      for (const chemical of chemicalList.chemical) {
        await questionModel.create({
          serviceId: serviceId,
          question: chemical,
          questionValue: chemical
            .toLowerCase()
            .replace(/ /g, "_")
            .replace(/[()]/g, ""),
          inputType: chemicalList.inputType,
        });
      }

      // Create question collection for providerList
      for (const provider of serviceProviderList.provider) {
        await questionModel.create({
          serviceId: serviceId,
          question: provider,
          questionValue: provider
            .toLowerCase()
            .replace(/ /g, "_")
            .replace(/[()]/g, ""),
          inputType: serviceProviderList.inputType,
        });
      }

      res.status(200).json(
        myResponse({
          statusCode: 200,
          status: "success",
          message: "Service created successfully",
          data: createAndUpdateEmployeeSubmitFormService,
        })
      );
    } else {
      // Update the service
      existingService.chemicalList = chemicalList;
      existingService.providerList = serviceProviderList;
      await existingService.save();

      // Update questions
      const allQuestions = chemicalList.chemical
        .map((chemical: string) => ({
          question: chemical,
          questionValue: chemical
            .toLowerCase()
            .replace(/ /g, "_")
            .replace(/[()]/g, ""),
          inputType: chemicalList.inputType,
        }))
        .concat(
          serviceProviderList.provider.map((provider: string) => ({
            question: provider,
            questionValue: provider
              .toLowerCase()
              .replace(/ /g, "_")
              .replace(/[()]/g, ""),
            inputType: serviceProviderList.inputType,
          }))
        );

      for (const questionData of allQuestions) {
        const existingQuestion = await questionModel.findOne({
          serviceId,
          questionValue: questionData.questionValue,
        });

        if (existingQuestion) {
          // Update existing question
          existingQuestion.question = questionData.question;
          existingQuestion.inputType = questionData.inputType;
          await existingQuestion.save();
        } else {
          // Create new question if it doesn't exist
          await questionModel.create({
            serviceId,
            ...questionData,
          });
        }
      }

      // Handle deletion of questions that are no longer present
      const existingQuestionValues = allQuestions.map(
        (q: { questionValue: any }) => q.questionValue
      );
      await questionModel.deleteMany({
        serviceId,
        questionValue: { $nin: existingQuestionValues },
      });

      // Send success response
      res.status(200).json(
        myResponse({
          statusCode: 200,
          status: "success",
          message: "Service and questions updated successfully",
          data: existingService,
        })
      );
    }
  } catch (error) {
    console.error(
      "Error in updateEmployeeSubmitFormService controller: ",
      error
    );
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const getEmployeeSubmitFormService = async (req: Request, res: Response) => {
  try {
    const userRole = req.userRole;

    // Check if user is ADMIN
    if (userRole !== "ADMIN") {
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
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "Service Id not found",
        })
      );
    }

    const service = await employeeSubmitFormServiceModel.findOne({ serviceId });

    if (!service) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "Service not found",
        })
      );
    }

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Service fetched successfully",
        data: service,
      })
    );
  } catch (error) {
    console.error("Error in getEmployeeSubmitFormService controller: ", error);
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
  createService,
  getService,
  updateService,
  singleService,
  employeeSubmitFormService,
  updateEmployeeSubmitFormService,
  getEmployeeSubmitFormService,
  deleteService,
};
