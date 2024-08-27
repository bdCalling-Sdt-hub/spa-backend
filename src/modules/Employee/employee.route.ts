import { Router } from "express";

import isValidate from "../../middlewares/auth";
import { createAttendance, employeeCheckIn, getAssignAppointment, getCheckBoxField, getInputField, unableServiceRequest } from "./employee.controller";




const router = Router();

router.post('/create-and-update-attendance',isValidate,createAttendance);
router.get('/get-assign-appointment',isValidate,getAssignAppointment);
router.post('/create-unable-appointment',isValidate,unableServiceRequest);
router.post('/employee-checkIn-appointment',isValidate,employeeCheckIn);
router.get('/get-Input-field',isValidate,getInputField);
router.get('/get-CheckBox-field',isValidate,getCheckBoxField);
router.post('/work-submission',isValidate,getCheckBoxField)








export const EmployeeRoutes = router;