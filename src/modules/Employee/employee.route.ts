import { Router } from "express";

import isValidate from "../../middlewares/auth";
import { createAttendance } from "./employee.controller";




const router = Router();

router.post('/create-and-update-attendance',isValidate,createAttendance);









export const EmployeeRoutes = router;