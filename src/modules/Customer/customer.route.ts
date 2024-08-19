import { Router } from "express";

import isValidate from "../../middlewares/auth";
import { createAppointment } from "./customer.controller";

const router = Router();

router.post("/create-appointment", isValidate, createAppointment);

export const CustomerRoutes = router;
