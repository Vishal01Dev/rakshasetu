import { z } from 'zod'

export const connectSchema = z.object({
    listingId: z.string().optional(),
    sellerId: z.string().min(1, "Seller ID is required"),
    message: z.string().max(500).optional(),
})

export const acceptConnectSchema = z.object({
    connectId: z.string().min(1, "Connect ID is required"),
})

export const rejectConnectSchema = z.object({
    connectId: z.string().min(1, "Connect ID is required"),
    rejectReason: z.string().max(500).optional(),
})