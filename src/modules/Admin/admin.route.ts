import isValidate from "../../middlewares/auth";
import { Router } from "express";
import { acceptOrRejectRequest, getAllAppointment, getAllEmployee, getAllEmployeeAttendance, getAllEmployeeRequest, getAllManager, getAllUser, getChatListSingleManager, getChatMessage, getSingleEmployee, getSingleManager } from "./admin.controller";



const router = Router();

router.get('/get-all-service-request',isValidate,getAllAppointment);
router.get('/get-employee-request',isValidate,getAllEmployeeRequest);
router.post('/accept-or-reject-request',isValidate,acceptOrRejectRequest);
router.get('/get-manager',isValidate,getAllManager);
router.get('/get-single-manager',isValidate,getSingleManager);
router.get('/get-single-chat',isValidate,getChatListSingleManager)
router.get('/get-chat-message',isValidate,getChatMessage);
router.get('/get-all-user',isValidate,getAllUser);
router.get('/get-all-employee',isValidate,getAllEmployee);
router.get('/get-single-employee',isValidate,getSingleEmployee);
router.get('/get-all-employee-attendance',isValidate,getAllEmployeeAttendance);












export const AdminRoutes = router;