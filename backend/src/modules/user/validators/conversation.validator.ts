import { z } from "zod";


export const messageSchema = z
    .object({
        content: z.string().optional(),
        conversationId: z.string(),
        senderId: z.string(),
    })
