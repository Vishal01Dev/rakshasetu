import { z } from "zod";

// For /create-razorpay-order
export const createRazorpayOrderSchema = z.object({
    receipt: z.string().min(1, "Receipt is required"),
    payment_mode: z.enum(["RAZORPAY", "QR", "LINK"]).optional(),
});

// For /verify-razorpay-payment
export const verifyRazorpayPaymentSchema = z.object({
    razorpay_order_id: z.string().min(1, "Order ID is required"),
    razorpay_payment_id: z.string().min(1, "Payment ID is required"),
    razorpay_signature: z.string().min(1, "Signature is required"),
    orderId: z.string().min(1, "Internal Order ID is required"),
});