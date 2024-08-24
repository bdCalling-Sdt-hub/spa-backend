import { Router } from "express";
import isValidate from "../../middlewares/auth";
import { addAboutUs, addPrivacyPolicy, addTermsCondition, changePassword } from "./settings.controller";
// import upload from "../../middlewares/fileUploadNormal";




const router = Router();

router.post('/change-password',isValidate,changePassword);
router.post('/add-privacy-policy',isValidate,addPrivacyPolicy);
router.post('/add-terms-condition',isValidate,addTermsCondition);
router.post('/add-about-us',isValidate,addAboutUs);
router.get('/privacy-policy',addPrivacyPolicy);
router.get('/terms-condition',addTermsCondition);
router.get('/about-us',addAboutUs);








export const SettingsRoutes = router;