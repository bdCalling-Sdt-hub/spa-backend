import { Router } from "express";

import isValidate from "../../middlewares/auth";
import { getNotification } from "./notification.controller";




const router = Router();

router.get('/',isValidate,getNotification);










export const NotificationRoutes = router;