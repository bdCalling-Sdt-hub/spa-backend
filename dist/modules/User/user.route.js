"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const router = (0, express_1.Router)();
router.post('/register', user_controller_1.signUp);
router.post('/verify-code', user_controller_1.verifyCode);
router.post('/resend-otp', user_controller_1.resendOtp);
router.post('/forgot-password', user_controller_1.forgotPassword);
router.post('/set-password', user_controller_1.setPassword);
router.post('/sign-in', user_controller_1.signIn);
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
exports.UserRoutes = router;
