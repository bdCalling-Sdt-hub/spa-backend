import { Request, Response } from "express";
import myResponse from "../../utils/Response";
import userModel from "../User/user.model";
import { comparePassword, hashPassword } from "../../service/hashPassword";
import privacyAndPolicyModel from "./model/privacyAndPolicy.model";
import termsAndConditionModel from "./model/termsAndCondition.model";
import aboutUsModel from "./model/aboutUs.model";


const changePassword = async (req: Request, res: Response) => {
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

        const { oldPassword, newPassword } = req.body;  

        if (!oldPassword || !newPassword) {
            return res.status(400).json(
                myResponse({
                    statusCode: 400,
                    status: "failed",
                    message: "All fields are required",
                })
            );
        }

        if (oldPassword === newPassword) {
            return res.status(400).json(
                myResponse({
                    statusCode: 400,
                    status: "failed",
                    message: "New password cannot be the same as old password",
                })
            );
        }

        const userExists = await userModel.findOne({ _id: user._id });
        if (!userExists) {
            return res.status(404).json(
                myResponse({
                    statusCode: 404,
                    status: "failed",
                    message: "User not found",
                })
            );
        }
        console.log("userExists: ", userExists);
        
        const isValidPassword = await comparePassword(oldPassword, userExists.password);

        console.log("isValidPassword: ", isValidPassword);
        

        if (!isValidPassword) {
            return res.status(400).json(
                myResponse({
                    statusCode: 400,
                    status: "failed",
                    message: "Old password is incorrect",
                })
            );
        }

        // const hashedPassword = await hashPassword(newPassword);
        // console.log("hashedPassword: ", hashedPassword);
        
        const updatedUser = await userModel.findByIdAndUpdate(user._id, { password: newPassword}, { new: true });
        console.log("updatedUser: ", updatedUser);
        
        if (!updatedUser) {
            return res.status(500).json(
                myResponse({
                    statusCode: 500,
                    status: "failed",
                    message: "Internal Server Error",
                })
            );
        }
        
        
        res.status(200).json(
            myResponse({
                statusCode: 200,
                status: "success",
                message: "Password changed successfully",
            })
        );
       
    } catch (error) {
        console.log("Error in changePassword controller: ", error);
        res.status(500).json(
            myResponse({
                statusCode: 500,
                status: "failed",
                message: "Internal Server Error",
            })
        );
    }
}


const addPrivacyPolicy = async (req: Request, res: Response) => {
    try {
        const adminId = req?.userId;
        const adminRole = req?.userRole;
        const admin = await userModel.findById(adminId);

        if (adminRole !== "ADMIN") {
            return res.status(401).json({
                status: "error",
                message: "You are not authorized",
                statusCode: 401,
                type: "Settings"
            });
        }

        let privacy = await privacyAndPolicyModel.findOne({});

        if (!privacy) {
            // If privacy policy doesn't exist, create it
            privacy = new privacyAndPolicyModel();
        }

        const { content } = req.body;

        if (!content) {
            return res.status(400).json(
                myResponse({
                    statusCode: 400,
                    status: "failed",
                    message: "Content is required",
                })
            );
        }

        privacy.content = content;
        await privacy.save();

        res.status(200).json(
            myResponse({
                statusCode: 200,
                status: "success",
                message: "Privacy policy added successfully",
                data: privacy
            })
        );

    } catch (error) {
        console.error("Error in addPrivacyPolicy controller:", error);
        res.status(500).json(
            myResponse({
                statusCode: 500,
                status: "failed",
                message: "Internal Server Error",
            })
        );
    }
}


const getPrivacyPolicy = async (req: Request, res: Response) => {
    try {
         const privacy = await privacyAndPolicyModel.findOne({});
         if (!privacy) {
             return res.status(404).json(myResponse({
                 message: "privacy not found",
                 statusCode: 404,
                 status: "failed"
             }));
         }
         res.status(200).json(myResponse({
             message: "privacy found",
             statusCode: 200,
             status: "success",
             data: privacy
         }));
         
    } catch (error) {
      console.log("Error in getPrivacyPolicy controller: ", error);
      res.status(500).json(myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      }))
      
    }
}



const addTermsCondition = async (req: Request, res: Response) => {
    try {
        const adminId = req?.userId;
        const adminRole = req?.userRole;
        const admin = await userModel.findById(adminId);
        console.log("admin: ", admin);
        

    if (!admin || adminRole !== "ADMIN") {
            return res.status(401).json({
                status: "error",
                message: "You are not authorized",
                statusCode: 401,
                type: "Settings"
            });
        }

        let termsCondition = await termsAndConditionModel.findOne({});


        if (!termsCondition) {
            // If terms and conditions don't exist, create them
            termsCondition = new termsAndConditionModel();
        }

        const { content } = req.body;

        if (!content) {
            return res.status(400).json(myResponse({
                statusCode: 400,
                status: "failed",
                message: "Content is required",
            }));
        }

        termsCondition.content = content;
        await termsCondition.save();

        res.status(201).json(
            myResponse({
                statusCode: 201,
                status: "success",
                message: "Terms and conditions added successfully",
            })
        );
    } catch (error) {
     console.log("Error in addTermsCondition controller: ", error);
     res.status(500).json(myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
     }))
     
    }
}


const getTermsCondition = async (req: Request, res: Response) => {
    try {
         // const userId = req.body.userId;
         // const admin = await User.findById(userId);
         // if(!admin.isAdmin){
         //      return res.status(401).json({
         //           status: "error",
         //           message: "You are not authorized",
         //           statusCode: 401,
         //           type: "Settings"
         //      });
         // }
         const terms = await termsAndConditionModel.findOne({});
         if(!terms){
              return res.status(404).json({
                   status: "failed",
                   message: "Terms not found",
                   statusCode: 404
              });
         }
         res.status(200).json({
              status: "success",
              message: "Terms found",
              statusCode: 200,
              data: terms
         });
    } catch (error) {
         res.status(500).json({
              status: "failed",
              message: "Internal Server Error",
              statusCode: 500
         });
    }
}

const addAboutUs = async (req: Request, res: Response) => {
    try {
        const adminId = req?.userId;
        const adminRole = req?.userRole;
        const admin = await userModel.findById(adminId);

        if (!admin || adminRole !== "ADMIN") {
            return res.status(401).json({
                status: "error",
                message: "You are not authorized",
                statusCode: 401,
                type: "Settings"
            });
        }

        let about = await aboutUsModel.findOne();

        if (!about) {
            // If About Us content doesn't exist, create it
            about = new aboutUsModel();
        }

        const { content } = req.body;

        if (!content) {
            return res.status(400).json(myResponse({
                statusCode: 400,
                status: "failed",
                message: "Content is required",
            }));
        }

        about.content = content;
        await about.save();

        res.status(201).json(myResponse({
            statusCode: 201,
            status: "success",
            message: "About Us added successfully",
            data: about
        }));
    } catch (error) {
        console.error(error);
        res.status(500).json(myResponse({
            statusCode: 500,
            status: "failed",
            message: "Internal Server Error",
        }));
    }
}


const getAboutUs = async (req: Request, res: Response) => {
    try {
         // const userId = req.body.userId;
         // const admin = await User.findById(userId);
         // if(!admin.isAdmin){
         //      return res.status(401).json({
         //           status: "error",
         //           message: "You are not authorized",
         //           statusCode: 401,
         //           type: "Settings"
         //      });
         // }
         const about = await aboutUsModel.findOne({});
         if(!about){
              return res.status(404).json(myResponse({
                  statusCode: 404,
                  status: "failed",
                  message: "About Us not found",
              }));
         }
         res.status(200).json(myResponse({
             statusCode: 200,
             status: "success",
             message: "About Us found",
             data: about
         }));
    } catch (error) {
      console.log("Error in getAboutUs controller: ", error);
      res.status(500).json(myResponse({
          statusCode: 500,
          status: "failed",
          message: "Internal Server Error",
      }));
      
    }
}

const getLoginUser = async (req: Request, res: Response) => {
    try {
        const userId = req?.userId;
        const admin = await userModel.findById(userId);
        if(!admin){
            return res.status(404).json(myResponse({
                statusCode: 404,
                status: "failed",
                message: "Login user not found",
            }));
        }
        res.status(200).json(myResponse({
             status: "success",
             message: "Login user found",
             statusCode: 200,
             data: admin
        }));
    } catch (error) {
        console.log("Error in getLoginUser controller: ", error);
        res.status(500).json(myResponse({
             status: "failed",
             message: "Internal Server Error",
             statusCode: 500
        })); 
    }
}

const htmlRoute = async (req: Request, res: Response) => {
    try {
        const privacy: any = await privacyAndPolicyModel.findOne({});
        console.log(privacy);
        
         if (!privacy) {
             return res.status(404).json(myResponse({
                 message: "privacy not found",
                 statusCode: 404,
                 status: "failed"
             }));
         }
        // console.log("aiman", privacy?.content);
        res.header("Content-Type", "text/html");
        res.send(`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title></title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
                color: #333;
            }
            .container {
                max-width: 800px;
                margin: 30px auto;
                padding: 20px;
                background: #fff;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            h1{
                color: #444;
            }
            footer {
                text-align: center;
                margin-top: 30px;
                font-size: 0.9em;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>${"Privacy Policy"}</h1>
            ${privacy?.content}
        </div>
    </body>
    </html>`);
      } catch (error) {
        res
          .status(500)
          .json(myResponse ({ message: "Internal server error", statusCode: 500 }));
      }
}


  

 export {changePassword,htmlRoute, addTermsCondition, getTermsCondition, addAboutUs, getAboutUs,getPrivacyPolicy, addPrivacyPolicy,getLoginUser}   