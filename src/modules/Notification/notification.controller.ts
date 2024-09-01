import { Request, Response } from "express";
import userModel from "../User/user.model";
import myResponse from "../../utils/Response";
import notificationModel from "../Manager/Model/notification.model";
import paginationBuilder from "../../utils/paginationBuilder";



const getNotification = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const user = await userModel.findOne({ _id: userId });

        if (!user) {
            return res.status(400).json(
                myResponse({
                    statusCode: 400,
                    status: "failed",
                    message: "You are not Logged in",
                })
            );
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const totalData = await notificationModel.countDocuments({ recipientId: userId });

        const notifications = await notificationModel.find({ recipientId: userId });

        if(!notifications || notifications.length === 0){
            return res.status(400).json(
                myResponse({
                    statusCode: 400,
                    status: "failed",
                    message: "No notifications found",
                })  
            );

        }

        const pagination = paginationBuilder({
            totalData,
            limit,
            currentPage: page
        });

        res.status(200).json(
            myResponse({
                statusCode: 200,
                status: "success",
                message: "Notifications fetched successfully",
                data: notifications,
                pagination
            })
        );
        


    } catch (error) {
        
    }
}

export {getNotification}