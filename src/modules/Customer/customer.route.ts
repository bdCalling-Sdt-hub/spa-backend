import { Router } from "express";

import isValidate from "../../middlewares/auth";
import { createAppointment, getOnlyAssignedAppointments, getSingleAssignedAppointment, getUserAppointments } from "./customer.controller";

const router = Router();

router.post("/create-appointment", isValidate, createAppointment);
router.get('/login-user-appointment-list',isValidate,getUserAppointments);
router.get('/login-user-assign-appointment-list',isValidate, getOnlyAssignedAppointments);
router.get('/login-user-assign-appointment-list/:id',isValidate, getSingleAssignedAppointment);

export const CustomerRoutes = router;
