import { ORDER_SOURCE, ORDER_STATUS, ORDER_TYPE } from "@prisma/client";
import prisma from "../../../config/db";
import { CreateOrderInput, isCustomOrder, isProductOrder, isServiceOrder } from "../validators/order.validator";
import { generateUID } from "../../../utils/generateUid";

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
    } = orderData;

    const orderUid = await generateUID("ord", "order", "orderUid");

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

    const order = await prisma.order.create({
        data: {
            id: orderUid,
            type: orderType,
            isCustom,
            amount: finalAmount,
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

    const orderMetaId = await generateUID("om", "orderMeta", "id", 8);

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

    return fullOrder;
}


export const handleGetOrderSummary = async (orderId: string, userId: string) => {
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

    return {
        id: order.id,
        type: order.type,
        isCustom: order.isCustom,
        status: order.status,
        title: order.isCustom ? order.customTitle : order.listing?.title,
        seller: order.seller,
        amount: order.amount,
        paymentMethod: order.paymentMethod,
        orderMeta: order.OrderMeta,
        notes: order.notes,
        createdAt: order.createdAt,
    };

}