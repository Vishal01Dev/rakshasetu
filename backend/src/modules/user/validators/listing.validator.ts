import { z } from 'zod'

export const listingSchema = z.object({
    type: z.enum(["PRODUCT", "SERVICE"]),
    title: z.string().min(3).max(100),
    description: z.string().min(10),
    category: z.string().min(2),
    subCategory: z.string().optional(),
    price: z
        .union([z.string(), z.number()])
        .transform(val => typeof val === "string" ? parseFloat(val) : val)
        .refine(val => !isNaN(val), { message: "Price must be a valid number" })
        .refine(val => val > 0, { message: "Price must be greater than 0" }),
    status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]).optional(),

    // Allow string or array, convert to array of trimmed strings
    tags: z
        .union([
            z.string(),            // e.g. "tshirt, cotton"
            z.array(z.string())    // e.g. ["tshirt", "cotton"]
        ])
        .optional()
        .transform(val => {
            if (!val) return [];
            if (typeof val === "string") {
                return val
                    .split(",")
                    .map(tag => tag.trim())
                    .filter(Boolean);
            }
            return val;
        }),

    // Allow object or JSON string, convert to object
    metadata: z
        .union([
            z.string(),           // e.g. '{"brand":"Nike"}'
            z.record(z.any())     // e.g. { brand: "Nike" }
        ])
        .optional()
        .transform(val => {
            if (!val) return undefined;
            if (typeof val === "string") {
                try {
                    return JSON.parse(val);
                } catch (err) {
                    return {}; // or throw error if you want strict validation
                }
            }
            return val;
        }),

    media: z.array(z.any()).optional(),

    externalLink: z.string().url().optional(),
});


export type ListingData = z.infer<typeof listingSchema>;