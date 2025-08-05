import { asyncHandler } from "../../../utils/asyncHandler";
import { handleCreateRazorpayOrder, handleVerifyRazorpayPayment } from "../services/payment.service";
import {
    createRazorpayOrderSchema,
    verifyRazorpayPaymentSchema,
} from "../validators/payment.validator";


export const createRazorpayOrder = asyncHandler(async (req, res, next) => {

    try {

        const { receipt } = createRazorpayOrderSchema.parse(req.body);

        const order = await handleCreateRazorpayOrder({
            receipt,
        });

        res.json({
            success: true,
            razorpay_order_id: order.id,
            orderId: order.orderId,
            amount: order.amount,
            currency: order.currency,
        });

    } catch (err) {
        next(err);
    }

});

export const verifyRazorpayPayment = asyncHandler(async (req, res, next) => {

    try {

        const data = verifyRazorpayPaymentSchema.parse(req.body);

        await handleVerifyRazorpayPayment(data);

        res.json({ success: true, message: "Payment verified successfully" });

    } catch (err) {
        next(err);
    }
});