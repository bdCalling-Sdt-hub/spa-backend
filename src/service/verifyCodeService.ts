import IUser from "../modules/User/user.interface";

const verifyCodeService = async (user: any, code: string) => {
  try {
    if (user.oneTimeCode === code) {
      user.isVerified = true;
      await user.save();
      setTimeout(async () => {
        user.oneTimeCode = null;
        await user.save();
        console.log("oneTimeCode reset to null after 3 minutes");
      }, 1000);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error in verifyCode service:", error);
    throw new Error("Error occurred while verifying code");
  }
};

export default verifyCodeService;
