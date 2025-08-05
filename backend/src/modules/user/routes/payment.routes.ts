import { Router } from "express";
import { verifyLoggedUser } from "../../../middlewares/middleware";
import { createRazorpayOrder, verifyRazorpayPayment } from "../controllers/payment.controller";

const router = Router();

router.use(verifyLoggedUser)

router.post("/create", createRazorpayOrder);
router.post("/verify", verifyRazorpayPayment);


export default router;