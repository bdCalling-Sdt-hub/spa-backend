import { Router } from "express";
import isValidate from "../../middlewares/auth";
import { assignEmployee, createManager, getAppointmentRequest, getCustomers, getEmployees, getService, getSingleCustomer, getSingleEmployee } from "./manager.controller";





const router = Router();

router.post('/create-account',isValidate,createManager);
router.post('/create-and-update-attendance',isValidate,createManager);
router.get('/get-customers',isValidate,getCustomers);
router.get('/get-customers/:id',isValidate,getSingleCustomer);
router.get('/get-employee',isValidate,getEmployees);
router.get('/get-employee/:id',isValidate,getSingleEmployee);
router.get('/get-service',isValidate,getService);
router.get('/get-appointment-request/:id',isValidate,getAppointmentRequest);
router.post('/assign-employee',isValidate,assignEmployee);




export const ManagerRoutes = router;