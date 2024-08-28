import { Router } from "express";

import isValidate from "../../middlewares/auth";
import { createAttendance, employeeCheckIn, getAssignAppointment, getCheckBoxField, getInputField, getWorkSubmission, unableServiceRequest, workSubmission, workUploadPhoto } from "./employee.controller";
import upload from "../../middlewares/fileUploadNormal";




const router = Router();

router.post('/create-and-update-attendance',isValidate,createAttendance);
router.get('/get-assign-appointment',isValidate,getAssignAppointment);
router.post('/create-unable-appointment',isValidate,unableServiceRequest);
router.post('/employee-checkIn-appointment',isValidate,employeeCheckIn);
router.get('/get-Input-field',isValidate,getInputField);
router.get('/get-CheckBox-field',isValidate,getCheckBoxField);
router.post('/work-submission',isValidate,workSubmission);
router.patch('/work-upload-photo',isValidate,upload.array('images'),workUploadPhoto);
router.get('/get-work-submission',isValidate,getWorkSubmission);









export const EmployeeRoutes = router;