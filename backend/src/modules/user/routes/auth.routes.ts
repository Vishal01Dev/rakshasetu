import { Router } from 'express';
import { registerUser, loginUser, verifyEmail, resendOtp, logoutUser, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { upload } from '../../../middlewares/multer';

const router = Router();

router.post('/register', upload.none(), registerUser);
router.post('/login', upload.none(), loginUser);
router.post('/verify-email', upload.none(), verifyEmail);
router.post('/resend-otp', upload.none(), resendOtp);
router.post('/logout', logoutUser);

router.post('/forgot-password', upload.none(), forgotPassword);
router.post('/reset-password/:token', upload.none(), resetPassword);


export default router;
