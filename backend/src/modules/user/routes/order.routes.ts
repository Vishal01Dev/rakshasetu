import { Router } from "express";
import { verifyLoggedUser } from "../../../middlewares/middleware";
import { createOrder, getOrderSummary, sendReleaseRequest, getRealeaseStatus, createDisputeTicket, getDisputeTicketStatus, getAllUserOrders } from "../controllers/order.controller";

const router = Router();

router.use(verifyLoggedUser)

router.post('/create', createOrder)
router.get('/:orderId/summary', getOrderSummary);
router.get('/', getAllUserOrders)

router.post('/:orderId/release-request', sendReleaseRequest);
router.get('/:orderId/release-status', getRealeaseStatus);


router.post('/:orderId/create-dispute', createDisputeTicket);
router.get('/:orderId/dispute-status', getDisputeTicketStatus);

export default router;