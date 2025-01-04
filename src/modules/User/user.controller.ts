import { Request, Response } from "express";
import myResponse from "../../utils/Response";
import userModel from "./user.model";
import userRegister from "../../service/userRegister";
import verifyCodeService from "../../service/verifyCodeService";
import { sentOtpByEmail } from "../../service/emailService";
import {
  generateToken,
  generateTokenForLogin,
  verifyToken,
} from "../../service/jwtService";
import { comparePassword } from "../../service/hashPassword";
import { on } from "winston-daily-rotate-file";
import IUser from "./user.interface";

const signUp = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      role,
    }: { name: string; email: string; password: string; role: string } =
      req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "All fields are required",
        })
      );
    }

    const user = await userModel.findOne({ email });

    if(user?.isDeleted){
      const oneTimeCode =
      Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
      const user = await userModel.findOneAndUpdate({ email }, { isDeleted: false, oneTimeCode }, { new: true });
     


       user && sentOtpByEmail(user?.email, oneTimeCode);

       setTimeout(async () => {
        try {
          if (user?.oneTimeCode) user.oneTimeCode = null;
          if (user) {
            await user.save();
          }
          console.log("one Time Code reset to null after 3 minutes");
        } catch (error) {
          console.error("Error updating oneTimeCode:", error);
        }
      }, 180000);
  


      return res.status(400).json(
        myResponse({
          statusCode: 200,
          status: "success",
          message: "A verification email is sent to your email",
          data: user,
        })
      );
    }

    if (user) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "User already exists",
        })
      );
    }

    const userCreate = await userRegister({ name, email, password, role });

    console.log(userCreate);

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "A verification email is sent to your email",
        data: userCreate,
      })
    );
  } catch (error) {
    console.error("Error in signUp controller:", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const verifyCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    console.log(email, code);

    const user = await userModel.findOne({ email });
    if (!email || !code) {
      return res.status(400).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "All fields are required",
        })
      );
    }
    if (!user) {
      return res.status(400).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "User not found",
        })
      );
    }

    const isVerifiedUser = await verifyCodeService(user, code);
    console.log("isVerifiedUser: ", isVerifiedUser);

    if (isVerifiedUser) {
      const accessToken = generateToken({
        email: user.email,
        id: user._id.toString(),
        name: user.name,
        role: user.role,
      });

      res.status(200).json(
        myResponse({
          statusCode: 200,
          status: "success",
          message: "User verified successfully",
          token: accessToken,
        })
      );
    } else {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Invalid code",
        })
      );
    }
  } catch (error) {
    console.error("Error in verifyCode controller:", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
};

const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Email are required",
        })
      );
    }

    const user = await userModel.findOne({ email });
    console.log("user: ", user);

    if (!user) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "User not found",
        })
      );
    }

    const currentTime = new Date().getTime();
    const oneMinute = 60 * 1000;

    if (user.updatedAt && currentTime - user.updatedAt.getTime() < oneMinute) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Please wait at least 1 minute before requesting a new OTP",
        })
      );
    }

    // Generate a new OTP
    const oneTimeCode =
      Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    console.log("oneTimeCode: ", oneTimeCode);
    console.log(oneTimeCode);

    if (user.oneTimeCode === null) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "OTP already sent",
        })
      );
    }

    user.oneTimeCode = oneTimeCode;

    await user.save();

    await sentOtpByEmail(email, oneTimeCode);
    console.log("OTP sent successfully");

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "OTP has been resent successfully",
      })
    );
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "Failed",
        message: "Failed to resend OTP",
      })
    );
  }
};

const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Email are required",
        })
      );
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "User not found",
        })
      );
    }

    const oneTimeCode =
      Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

    try {
      sentOtpByEmail(email, oneTimeCode);
    } catch (error) {
      console.error("Failed to send verification email", error);
      throw new Error("Error creating user");
    }

    user.oneTimeCode = oneTimeCode;
    await user.save();

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "A verification code is sent to your email",
      })
    );
  } catch (error: any) {
    console.error("Error in forgotPassword controller:", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        message: `Internal server error ${error.message}`,
        status: "Failed",
      })
    );
  }
};

const setPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Token or password are required",
        })
      );
    }
    const userData = verifyToken(token);

    if (!userData) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Invalid token",
        })
      );
    }

    const expireDate = new Date(userData.exp * 1000);
    if (expireDate < new Date()) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "Token expired",
        })
      );
    }

    const user = await userModel.findOne({ _id: userData.id });
    if (!user) {
      return res.status(400).json(
        myResponse({
          statusCode: 400,
          status: "failed",
          message: "User not found",
        })
      );
    }

    user.password = password;
    await user.save();

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Password has been set successfully",
      })
    );
  } catch (error: any) {
    console.error("Error in setPassword controller:", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        message: `Internal server error ${error.message}`,
        status: "Failed",
      })
    );
  }
};

const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "User not found",
        })
      );
    }

    if (!user.isVerified) {
      return res.status(401).json(
        myResponse({
          statusCode: 401,
          status: "failed",
          message: "Please verify your account",
        })
      );
    }

    if(user.isDeleted){
      return res.status(401).json(
        myResponse({
          statusCode: 401,
          status: "failed",
          message: "Your account has been deleted",
        })
      );
    }

    console.log(user.password);
    if(!user?.isProfileCompleted && user?.role === "EMPLOYEE" && !user?.isEmployee){ 
      return res.status(401).json(
        myResponse({
          statusCode: 401,
          status: "failed",
          message: "Please complete your profile",
        })
      );
    }

    if (user?.role === "EMPLOYEE" && !user?.isEmployee) {
      return res.status(401).json(
        myResponse({
          statusCode: 401,
          status: "failed",
          message: "Your account is currently being verified by the admin. Thank you for your patience!",
        })
      );
    }

  


    const isPasswordMatch = await comparePassword(password, user.password);
    console.log("isPasswordMatch: ", isPasswordMatch);

    if (!isPasswordMatch) {
      return res.status(401).json(
        myResponse({
          statusCode: 401,
          status: "failed",
          message: "Incorrect password",
        })
      );
    }

    const accessToken = generateTokenForLogin({
      email: user.email,
      id: user._id.toString(),
      name: user.name,
      role: user.role,
    });

    console.log("accessToken: ", accessToken);

    if (!accessToken) {
      return res.status(500).json(
        myResponse({
          statusCode: 500,
          status: "failed",
          message: "Failed to generate access token",
        })
      );
    }

    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "Login successful",
        data: user,
        token: accessToken,
      })
    );
  } catch (error) {
    console.log("Error in signIn controller: ", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal server error",
      })
    );
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json(
        myResponse({
          statusCode: 404,
          status: "failed",
          message: "User not found",
        })
      );
    } 
    user.isDeleted = true;
    await user.save();
    res.status(200).json(
      myResponse({
        statusCode: 200,
        status: "success",
        message: "User deleted successfully",
      })
    );
  } catch (error) {
    console.error("Error in deleteUser controller:", error);
    res.status(500).json(
      myResponse({
        statusCode: 500,
        status: "failed",
        message: "Internal Server Error",
      })
    );
  }
}

export { signUp, verifyCode, resendOtp, forgotPassword, setPassword, signIn,deleteUser };
