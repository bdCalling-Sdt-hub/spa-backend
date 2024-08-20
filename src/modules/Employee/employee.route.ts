import { Router } from "express";

import isValidate from "../../middlewares/auth";
import { createAttendance, getAssignAppointment, unableServiceRequest } from "./employee.controller";




const router = Router();

router.post('/create-and-update-attendance',isValidate,createAttendance);
router.get('/get-assign-appointment',isValidate,getAssignAppointment);
router.post('/create-unable-appointment',isValidate,unableServiceRequest);









export const EmployeeRoutes = router;