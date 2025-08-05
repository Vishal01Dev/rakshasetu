import { DISPUTE_TYPE, ORDER_SOURCE, ORDER_STATUS, ORDER_TYPE, RELEASE_STATUS } from "@prisma/client";
import prisma from "../../../config/db";
import { calculatePlatformFee } from "../../../config/platformFee";
import { generateUID } from "../../../utils/generateUid";
import { CreateOrderInput, isCustomOrder, isProductOrder, isServiceOrder } from "../validators/order.validator";
import { handleCreateRazorpayOrder } from "./payment.service";

export const handleCreateOrder = async (orderData: CreateOrderInput, userId: string) => {
    const {
        listingId,
        price,
        sellerId,
        meta,
        note,
        quantity,
        totalAmount,
        customAmount,
        customDescription,
        customTitle,
        paymentMethod,
        platformFeePaidBy
    } = orderData;

    const orderUid = await generateUID("ord", "order", "id", 10);

    let orderType: ORDER_TYPE;
    let finalAmount: number;
    let isCustom = false;
    let customTitleFinal: string | null = null;
    let customDescFinal: string | null = null;



    if (isProductOrder(orderData)) {
        orderType = ORDER_TYPE.PRODUCT;
        if (!quantity || !totalAmount) throw new Error("Missing quantity or total");
        finalAmount = parseFloat(totalAmount);
    } else if (isServiceOrder(orderData)) {
        orderType = ORDER_TYPE.SERVICE;
        finalAmount = parseFloat(price);
    } else if (isCustomOrder(orderData)) {
        orderType = ORDER_TYPE.CUSTOM;
        isCustom = true;
        finalAmount = customAmount ?? parseFloat(price);
        customTitleFinal = customTitle ?? "Untitled Custom Order";
        customDescFinal = customDescription ?? "No description";
    } else {
        throw new Error("Invalid order type.");
    }

    const feePayer = platformFeePaidBy ?? "BUYER";
    const platformFeeAmount = parseFloat((await calculatePlatformFee(finalAmount)).toFixed(2));

    let finalBuyerAmount = finalAmount;
    let sellerReceives = finalAmount;



    if (platformFeeAmount > 0) {
        switch (feePayer) {
            case "BUYER":
                finalBuyerAmount += platformFeeAmount;
                break;
            case "SELLER":
                sellerReceives -= platformFeeAmount;
                break;
            case "BOTH":
                const half = parseFloat((platformFeeAmount / 2).toFixed(2));
                finalBuyerAmount += half;
                sellerReceives -= half;
                break;
        }
    }

    const order = await prisma.order.create({
        data: {
            id: orderUid,
            type: orderType,
            isCustom,
            amount: finalAmount,
            platformFeeAmount,
            platformFeePaidBy: feePayer,
            finalBuyerAmount,
            sellerReceives,
            buyerId: userId,
            sellerId,
            listingId: listingId || null,
            status: ORDER_STATUS.CREATED,
            currency: "INR",
            paymentMethod,
            source: ORDER_SOURCE.B2B,
            notes: note || null,
            customTitle: customTitleFinal,
            customDesc: customDescFinal,
        },
    });

    const orderMetaId = await generateUID("om", "orderMeta", "id", 10);

    // 🧩 Create OrderMeta if meta provided
    if (meta && typeof meta === "object") {
        await prisma.orderMeta.create({
            data: {
                id: orderMetaId,
                orderId: order.id,
                deliveryDate: meta.deliveryDate ? new Date(meta.deliveryDate) : undefined,
                deliveryMode: meta.deliveryMode || null,
                location: meta.location || null,
                attachments: meta.attachments || undefined,
                extraDetails: meta.extraDetails || undefined,
            },
        });
    }

    const escrowId = await generateUID("et", "escrowTransaction", "id", 10);

    await prisma.escrowTransaction.create({
        data: {
            paymentMode: "RAZORPAY",
            id: escrowId,
            orderId: order.id,
            amount: finalBuyerAmount,
            platformFeeAmount,
            platformFeePaidBy: feePayer,
            sellerReceives,
            status: "PENDING",
        },
    });

    let fullOrderDetails;

    const fullOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
            OrderMeta: true,
            seller: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    image: true,
                },
            },
            listing: {
                select: {
                    id: true,
                    title: true,
                },
            },
        }

    })



    if (paymentMethod === "PREPAID") {
        const razorpayOrder = await handleCreateRazorpayOrder({
            receipt: order.id,
        })

        fullOrderDetails = {
            ...fullOrder,
            razorpayOrder: {
                razorpay_order_id: razorpayOrder.id,
                orderId: razorpayOrder.orderId,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
            }
        };

    }
    else {
        fullOrderDetails = {
            ...fullOrder,
        };
    }

    return fullOrderDetails;
}


export const handleGetOrderSummary = async (orderId: string, userId: string) => {

    console.log(orderId, userId);

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            OrderMeta: true,
            seller: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    image: true,
                    business: true
                },
            },
            listing: {
                select: {
                    id: true,
                    title: true,
                },
            },
        }
    });

    if (!order) throw new Error("Order not found");

    if (order.buyerId !== userId && order.sellerId !== userId) {
        throw new Error("Unauthorized access to this order");
    }

    return order

}

export const handleSendReleaseRequest = async (orderId: string, userId: string) => {
    const order = await prisma.order.findUnique({
        where: { id: orderId, buyerId: userId },
        include: {
            transaction: true
        }
    })

    if (!order) {
        throw new Error("Order not found or you are not authorized to release this order");
    }

    if (order.status !== ORDER_STATUS.DELIVERED) {
        throw new Error("Order is not completed, cannot send release request");
    }
    if (order.transaction?.releaseRequested) {
        throw new Error("Release request already sent for this order");
    }

    const updatedTransaction = await prisma.escrowTransaction.update({
        where: { orderId: order.id },
        data: {
            releaseRequested: true,
            releaseRequestedAt: new Date(),
            releaseRequestedByUserId: userId,
            releaseStatus: RELEASE_STATUS.SENT,
            releaseNotes: "Release requested by buyer",
        }
    });

    if (!updatedTransaction) {
        throw new Error("Failed to update transaction for release request");
    }

    return updatedTransaction

}


export const handleGetReleaseStatus = async (orderId: string, userId: string) => {
    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            OR: [
                { buyerId: userId },
                { sellerId: userId }
            ]
        },
        include: {
            transaction: true
        }
    });

    if (!order) {
        throw new Error("Order not found or you are not authorized to view release status");
    }

    if (!order.transaction) {
        throw new Error("No transaction found for this order");
    }

    return {
        releaseRequested: order.transaction.releaseRequested,
        releaseRequestedAt: order.transaction.releaseRequestedAt,
        releaseStatus: order.transaction.releaseStatus,
        releaseNotes: order.transaction.releaseNotes,
        releaseRequestedByUserId: order.transaction.releaseRequestedByUserId,
        releaseApprovedByAdmin: order.transaction.releaseApprovedByAdmin,
        releaseApprovedAt: order.transaction.releaseApprovedAt,
        releaseApprovedByAdminId: order.transaction.releaseApprovedByAdminId
    };
}


export const handleCreateDisputeTicket = async (
    orderId: string,
    userId: string,
    type: DISPUTE_TYPE,         // e.g. QUALITY_ISSUE, DELAYED_DELIVERY
    reason: string              // short text like "Received damaged product"
) => {
    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            OR: [
                { buyerId: userId },
                { sellerId: userId }
            ]
        },
        include: {
            transaction: true,
            ticket: true
        }
    });

    if (!order) {
        throw new Error("Order not found or you are not authorized to create a dispute");
    }

    if (order.status !== ORDER_STATUS.DELIVERED) {
        throw new Error("Order is not completed, cannot create dispute");
    }

    if (order.transaction?.releaseRequested) {
        throw new Error("Release request already sent for this order, cannot create dispute");
    }

    if (order.ticket) {
        throw new Error("Dispute ticket already exists for this order");
    }

    const id = await generateUID("dt", "disputeTicket", "id", 10);

    const disputeTicket = await prisma.disputeTicket.create({
        data: {
            id,
            orderId: order.id,
            status: "OPEN",
            type,
            openedBy: userId,
            reason
        }
    });

    return disputeTicket;
};


export const handleGetDisputeTicketStatus = async (orderId: string, userId: string) => {
    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            OR: [
                { buyerId: userId },
                { sellerId: userId }
            ]
        },
        include: {
            ticket: true
        }
    });

    if (!order) {
        throw new Error("Order not found or you are not authorized to view dispute status");
    }

    if (!order.ticket) {
        throw new Error("No dispute ticket found for this order");
    }

    return order.ticket;
}


export const handleGetAllUserOrders = async (userId: string) => {
    const orders = await prisma.order.findMany({
        where: {
            OR: [
                { buyerId: userId },
                { sellerId: userId }
            ]
        },
        include: {
            OrderMeta: true,
            seller: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    image: true,
                    business: true
                },
            },
            buyer: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    image: true,
                    business: true
                },
            },
            listing: {
                select: {
                    id: true,
                    title: true,
                },
            },
            transaction: {
                include: {
                    refunds: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    if (!orders || orders.length === 0) {
        return [];
    }

    return orders;
}