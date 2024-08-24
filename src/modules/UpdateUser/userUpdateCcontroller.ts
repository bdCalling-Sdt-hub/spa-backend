import { Request, Response } from "express";
import myResponse from "../../utils/Response";
import userModel from "../User/user.model";




const updateUserProfile = async (req: Request, res: Response) => {
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

        const {name,phone,address} = req.body;

        const updateData: {
            name?: string;
            phone?: string;
            address?: string
            image?: {
                publicFileURL: string;
                path: string;
            }
        } = {}

        if(name){
            updateData.name = name;
        }

        if(phone){
            updateData.phone = phone;
        }
        if(address){
            updateData.address = address;
        }

        if (req.file) {
            const imageFile = req.file;
            updateData.image = {
                publicFileURL: `images/users/${imageFile.filename}`,
                path: `public/images/users/${imageFile.filename}`,
            };
        }

if(Object.keys(updateData).length === 0){
    return res.status(400).json(
        myResponse({
            statusCode: 400,
            status: "failed",
            message: "No data to update",
        })
    );
}

const updateUser = await userModel.findByIdAndUpdate(user._id, updateData, {
    new: true,
});

if(!updateUser){
    return res.status(400).json(
        myResponse({
            statusCode: 400,
            status: "failed",
            message: "Update failed",
        })
    );
}
        
        return res.status(200).json(
            myResponse({
                statusCode: 200,
                status: "success",
                message: "User profile updated successfully",
                data: updateUser,
            })
        );
       

        
        
    } catch (error) {
        console.log("Error in updateUserProfile controller: ", error);
        res.status(500).json(
            myResponse({
                statusCode: 500,
                status: "failed",
                message: "Internal Server Error",
            })
        );
        
    }
}





export {updateUserProfile}