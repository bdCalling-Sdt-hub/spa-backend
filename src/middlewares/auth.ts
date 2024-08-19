import { NextFunction, Request, Response } from "express";
import config from "../config";
import userModel from "../modules/User/user.model";
import myResponse from "../utils/Response";
import jwt from "jsonwebtoken";
import { verifyToken } from "../service/jwtService";
import { Types } from 'mongoose';


declare module "express-serve-static-core" {
  interface Request {
    user?: any;
    userRole?: string;
    userId?: Types.ObjectId;
  }
}

const isValidate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json(
        myResponse({
          statusCode: 401,
          status: "fail",
          message: "Token is Required",
        })
      );
    }
    if (!authorization.startsWith("Bearer")) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "fail",
          message: "Invalid Token Format",
        })
      );
    }

    const token = authorization.split(" ")[1];

    let decodedData;
    try {
      decodedData = verifyToken(token);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json(
          myResponse({
            statusCode: 401,
            status: "fail",
            message: "Token Expired",
          })
        );
      } else if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json(
          myResponse({
            statusCode: 401,
            status: "fail",
            message: "Invalid Token",
          })
        );
      } else {
        throw error;
      }
    }
    const user = await userModel.findById(decodedData?.id);

    if (!user) {
      return res.status(401).json(
        myResponse({
          statusCode: 401,
          status: "fail",
          message: "User Not Found",
        })
      );
    }


    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    next();
  } catch (error) {
    console.log("IsVerified Middleware Error", error);
    return res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "fail",
        message: "Internal Server Error",
      })
    );
  }
};



export default isValidate;