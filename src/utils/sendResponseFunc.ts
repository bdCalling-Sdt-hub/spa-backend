import { Response } from "express";
import { TResponse } from "../interface/global.interface";

const sendResponseFunc = <T>(res: Response, data: TResponse<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    statusCode: data.statusCode,
    message: data?.message,
    meta: data.pagination,
    data: data.data,
  });
};



export default  Response;
