import { asyncHandler } from "../../../utils/asyncHandler";
import { handleCreateOrder, handleGetOrderSummary } from "../services/order.service";
import { CreateOrderInput, createOrderSchema } from "../validators/order.validator";


export const createOrder = asyncHandler(async (req, res, next) => {
    try {

        const userId = req?.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const orderData: CreateOrderInput = createOrderSchema.parse(req.body)

        const order = await handleCreateOrder(orderData, userId);

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: order
        });


    } catch (err) {
        next(err);
    }
})

export const getOrderSummary = asyncHandler(async (req, res, next) => {
    try {

        const userId = req?.user?.id;

        const orderId = req.params.orderId;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!orderId) {
            return res.status(400).json({ error: "Order ID is required" });
        }

        const orderSummary = await handleGetOrderSummary(orderId, userId);

        res.status(200).json({
            success: true,
            data: orderSummary
        });

    } catch (err) {
        next(err);
    }
})