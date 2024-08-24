import { Router } from "express";
import isValidate from "../../middlewares/auth";
import upload from "../../middlewares/fileUploadNormal";
import { updateUserProfile } from "./userUpdateCcontroller";



const router = Router();

router.post('/',isValidate,upload.single('image'),updateUserProfile);









export const UpdateUserRoutes = router;