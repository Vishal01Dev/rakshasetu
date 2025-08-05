import { asyncHandler } from "../../../utils/asyncHandler";
import { handleCreateDisputeTicket, handleCreateOrder, handleGetAllUserOrders, handleGetDisputeTicketStatus, handleGetOrderSummary, handleGetReleaseStatus, handleSendReleaseRequest } from "../services/order.service";
import { createDisputeTicketSchema, CreateOrderInput, createOrderSchema } from "../validators/order.validator";


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

export const sendReleaseRequest = asyncHandler(async (req, res, next) => {
    try {

        const userId = req?.user?.id;

        const orderId = req.params.orderId;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!orderId) {
            return res.status(400).json({ error: "Order ID is required" });
        }

        const releaseRequest = await handleSendReleaseRequest(orderId, userId);

        res.status(200).json({
            success: true,
            data: releaseRequest,
            message: "Release request sent successfully"
        });

    } catch (err) {
        next(err);
    }
})

export const getRealeaseStatus = asyncHandler(async (req, res, next) => {
    try {

        const userId = req?.user?.id;

        const orderId = req.params.orderId;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!orderId) {
            return res.status(400).json({ error: "Order ID is required" });
        }

        const releaseStatus = await handleGetReleaseStatus(orderId, userId);

        res.status(200).json({
            success: true,
            data: releaseStatus
        });

    } catch (err) {
        next(err);
    }
})


export const createDisputeTicket = asyncHandler(async (req, res, next) => {
    try {

        const userId = req?.user?.id;

        const orderId = req.params.orderId;

        const { type, reason } = createDisputeTicketSchema.parse(req.body);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!orderId) {
            return res.status(400).json({ error: "Order ID is required" });
        }

        const disputeTicket = await handleCreateDisputeTicket(orderId, userId, type, reason);

        res.status(200).json({
            success: true,
            data: disputeTicket,
            message: "Dispute ticket created successfully"
        });


    } catch (err) {
        next(err)
    }
})


export const getDisputeTicketStatus = asyncHandler(async (req, res, next) => {
    try {

        const userId = req?.user?.id;

        const orderId = req.params.orderId;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!orderId) {
            return res.status(400).json({ error: "Order ID is required" });
        }

        const disputeStatus = await handleGetDisputeTicketStatus(orderId, userId);

        res.status(200).json({
            success: true,
            data: disputeStatus
        });

    } catch (err) {
        next(err);
    }
})

export const getAllUserOrders = asyncHandler(async (req, res, next) => {

    try {

        const userId = req?.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const orders = await handleGetAllUserOrders(userId);

        res.status(200).json({
            success: true,
            data: orders
        });

    } catch (err) {
        next(err);
    }

})