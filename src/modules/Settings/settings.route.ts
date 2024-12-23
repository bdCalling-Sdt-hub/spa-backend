import { Router } from "express";
import isValidate from "../../middlewares/auth";
import { addAboutUs, addPrivacyPolicy, addTermsCondition, changePassword, getAboutUs, getLoginUser, getPrivacyPolicy, getTermsCondition, htmlRoute } from "./settings.controller";
// import upload from "../../middlewares/fileUploadNormal";




const router = Router();
router.get('/privacy-policy',getPrivacyPolicy);
router.get('/privacy-policy-page',htmlRoute)
router.get('/terms-condition',getTermsCondition);
router.get('/about-us',getAboutUs);
router.get('/get-login-user',isValidate,getLoginUser);
router.post('/change-password',isValidate,changePassword);
router.post('/add-privacy-policy',isValidate,addPrivacyPolicy);
router.post('/add-terms-condition',isValidate,addTermsCondition);
router.post('/add-about-us',isValidate,addAboutUs);




export const SettingsRoutes = router;