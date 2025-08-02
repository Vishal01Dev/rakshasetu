import { Router } from "express";
import { upload } from "../../../middlewares/multer";
import { forgotPassword, loginAdmin, logoutAdmin, resendOtp, resetPassword, verifyEmail } from "../controllers/auth.controller";

const router = Router();

router.post("/login", upload.none(), loginAdmin);
router.post('/logout', logoutAdmin);
router.post('/verify-email', upload.none(), verifyEmail)
router.post('/resend-otp', upload.none(), resendOtp)

router.post('/forgot-password', upload.none(), forgotPassword);
router.post('/reset-password/:token', upload.none(), resetPassword);

export default router;