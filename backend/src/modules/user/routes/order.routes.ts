import { Router } from "express";
import { verifyLoggedUser } from "../../../middlewares/middleware";
import { createOrder, getOrderSummary } from "../controllers/order.controller";

const router = Router();

router.use(verifyLoggedUser)

router.post('/create', createOrder)
router.get('/:orderId/summary', getOrderSummary);

export default router;