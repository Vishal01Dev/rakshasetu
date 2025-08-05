import crypto from "crypto";
import { razorpay } from "../../../utils/razorpay";
import prisma from "../../../config/db";
import { PAYMENT_GATEWAY_METHOD } from "@prisma/client";

export const handleCreateRazorpayOrder = async ({
    receipt,
    payment_mode = "RAZORPAY",
}: {
    receipt: string;
    payment_mode?: "RAZORPAY" | "QR" | "LINK";
}) => {

    const order = await prisma.order.findUnique({
        where: { id: receipt, status: "CREATED" }
    })

    if (!order) {
        throw new Error("Order not found");
    }

    const finalAmount = order.finalBuyerAmount

    const options = {
        amount: Math.round(finalAmount * 100),
        currency: "INR",
        receipt,
        notes: {
            payment_mode,
        }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return {
        orderId: order.id,
        ...razorpayOrder
    }

};

export const handleVerifyRazorpayPayment = async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
}: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderId: string;
}) => {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
        .update(body)
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        throw new Error("Invalid signature");
    }

    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);

    const rawPaymentMode = razorpayOrder.notes?.payment_mode;

    const payment_mode: PAYMENT_GATEWAY_METHOD =
        rawPaymentMode === "RAZORPAY" ||
            rawPaymentMode === "QR" ||
            rawPaymentMode === "LINK"
            ? rawPaymentMode
            : "RAZORPAY";


    await prisma.escrowTransaction.update({
        where: { orderId },
        data: {
            status: "SUCCESS",
            paymentMode: payment_mode,
            razorpayPaymentId: razorpay_payment_id,
            paidAt: new Date(),
        },
    });

    await prisma.order.update({
        where: { id: orderId },
        data: {
            status: "PAID",
            paymentStatus: "SUCCESS",
            razorpayOrderId: razorpay_order_id,
        },
    });

    return true;
};
