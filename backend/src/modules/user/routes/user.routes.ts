import e, { Router } from 'express';
import { upload } from '../../../middlewares/multer';
import { verifyLoggedUser } from '../../../middlewares/middleware';
import { changePassword, verifyAdharOtp, verifyKyc, updateUser, verifyBankDetails, verifyGst, getLoggedUserDetails } from '../controllers/user.controller';

const router = Router();

router.use(verifyLoggedUser);

router.post('/update-user', upload.single('image'), updateUser)
router.post('/change-password', upload.none(), changePassword)
router.post('/verify-kyc', upload.none(), verifyKyc)
router.post('/verify-aadhar-otp', upload.none(), verifyAdharOtp);
router.post('/verify-bank-details', upload.none(), verifyBankDetails)
router.post('/verify-gst', upload.none(), verifyGst);

router.get('/current-user', getLoggedUserDetails)

export default router;