import { Router } from "express";

import isValidate from "../../middlewares/auth";
import { createAppointment, getOnlyAssignedAppointments, getSingleAssignedAppointment, getUserAppointments, getWorkSubmissionByUser } from "./customer.controller";

const router = Router();

router.post("/create-appointment", isValidate, createAppointment);
router.get('/login-user-appointment-list',isValidate,getUserAppointments);
router.get('/login-user-assign-appointment-list',isValidate, getOnlyAssignedAppointments);
router.get('/login-user-assign-appointment-list/:id',isValidate, getSingleAssignedAppointment);
router.get('/appointment-result',isValidate, getWorkSubmissionByUser);

export const CustomerRoutes = router;
