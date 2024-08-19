import { Router } from "express";
import { forgotPassword, resendOtp, setPassword, signIn, signUp, verifyCode } from "./user.controller";


const router = Router();

router.post('/register',signUp);
router.post('/verify-code',verifyCode)
router.post('/resend-otp',resendOtp)
router.post('/forgot-password',forgotPassword)
router.post('/set-password',setPassword)
router.post('/sign-in',signIn)


// router.post(
//   '/login',
//   validationMiddleware(UserValidations.userLoginUserValidationSchema),
//   UserControllers.loginUser,
// );
// router.post(
//   '/change-password',
//   authMiddleware("admin","user"),
//   validationMiddleware(UserValidations.passwordChangeValidationSchema),
//   UserControllers.userChangePassword,
// );



export const UserRoutes = router;