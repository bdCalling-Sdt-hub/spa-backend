import userModel from "../modules/User/user.model";
import { sentOtpByEmail } from "./emailService";

const userRegister = async ({
  name,
  email,
  password,
  role,
}: {
  name: string;
  email: string;
  password: string;
  role: string;
}) => {
  try {
    const oneTimeCode =
      Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

    try {
      sentOtpByEmail(email, oneTimeCode);
    } catch (error) {
      console.error("Failed to send OTP: ", error);
    }
    if (!oneTimeCode) return;

    const user = await userModel.create({
      name,
      email,
      role,
      password,
      oneTimeCode,
    });

    setTimeout(async () => {
      try {
        user.oneTimeCode = null;
        await user.save();
        console.log("oneTimeCode reset to null after 3 minutes");
      } catch (error) {
        console.error("Error updating oneTimeCode:", error);
      }
    }, 180000);

    return user; // 3 minutes after otp is sent
  } catch (error) {
    console.error("Error in userRegister service:", error);
    throw new Error("Error occurred while registering user");
  }
};

export default userRegister;
