import { Router } from "express";
import { createService, deleteService, employeeSubmitFormService, getEmployeeSubmitFormService, getService, singleService, updateEmployeeSubmitFormService, updateService } from "./services.controller";
import isValidate from "../../middlewares/auth";
import upload from "../../middlewares/fileUploadNormal";



const router = Router();

router.post('/add-service',isValidate,upload.single('image'),createService);
router.get('/get-service',isValidate,getService);
router.post('/delete-service',isValidate,deleteService);
router.patch('/update-service',isValidate,upload.single('image'),updateService);
router.get('/single-service',isValidate,singleService);
router.post('/employee-submit-form-service',isValidate,employeeSubmitFormService);
router.put('/update-employee-submit-form-service',isValidate,updateEmployeeSubmitFormService);
router.get('/get-employee-submit-form-service',isValidate,getEmployeeSubmitFormService);









export const ServiceRoutes = router;