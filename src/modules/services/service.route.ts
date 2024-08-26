import { Router } from "express";
import { createService, employeeSubmitFormService, getService, singleService, updateService } from "./services.controller";
import isValidate from "../../middlewares/auth";
import upload from "../../middlewares/fileUploadNormal";



const router = Router();

router.post('/add-service',isValidate,upload.single('image'),createService);
router.get('/get-service',isValidate,getService);
router.patch('/update-service',isValidate,upload.single('image'),updateService);
router.get('/single-service',isValidate,singleService);
router.get('/employee-submit-form-service',isValidate,employeeSubmitFormService);








export const ServiceRoutes = router;