import { PAYMENT_METHOD } from '@prisma/client';
import { z } from 'zod';

export const createOrderSchema = z.object({
    // Shared fields
    listingId: z.string().nullable(), // null means custom order
    sellerId: z.string().min(1, "Seller ID is required"),
    price: z.string().min(1, "Price is required"), // Used in service and custom
    totalAmount: z.string().optional(), // Only for product orders
    quantity: z.number().int().positive().optional(), // Only for product orders
    note: z.string().max(500).optional(),
    paymentMethod: z.enum(["PAY_ON_DELIVERY", "PREPAID"]),

    // Custom order specific fields (shown only when listingId is null)
    customTitle: z.string().min(3).max(100).optional(),
    customDescription: z.string().min(10).max(2000).optional(),
    customAmount: z.coerce.number().positive().optional(),

    // platform fee details
    platformFeePaidBy: z.enum(["BUYER", "SELLER", "BOTH"]).optional(),

    // Optional metadata (used in custom and service orders)
    meta: z
        .object({
            deliveryMode: z.enum(["remote", "in-person"]).optional(),
            deliveryDate: z.string().datetime().optional(),
            location: z.string().max(200).optional(),
            attachments: z
                .array(
                    z.object({
                        name: z.string(),
                        url: z.string().url(),
                        type: z.string(),
                    })
                )
                .optional(),
            extraDetails: z.record(z.any()).optional(), // Flexible structure
        })
        .optional(),
});


export const isProductOrder = (data: any) =>
    data.listingId && typeof data.quantity === "number";

// Service Order: has listingId but no quantity
export const isServiceOrder = (data: any) =>
    data.listingId && typeof data.quantity === "undefined";

// Custom Order: listingId is null
export const isCustomOrder = (data: any) => data.listingId === null;

export type CreateOrderInput = z.infer<typeof createOrderSchema>;


export const createDisputeTicketSchema = z.object({
    type: z.enum(["DELIVERY_FAILURE",
        "ITEM_ISSUE",
        "REFUND_REQUEST",
        "FRAUD",
        "OTHER"]),
    reason: z.string().max(500),
})