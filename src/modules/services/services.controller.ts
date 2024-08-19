import { Request, Response } from "express";
import serviceModel from "./service.model";
import myResponse from "../../utils/Response";
import IService from "./services.interface";

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
    const service = await serviceModel.find();
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
    if(!user){
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

export { createService, getService, updateService,singleService };
