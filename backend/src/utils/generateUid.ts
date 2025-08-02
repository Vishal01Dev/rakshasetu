import crypto from "crypto";
import prisma from "../config/db";

/**
 * Generates a unique UID with a prefix (e.g., "ord") and checks that it's not duplicated in DB.
 *
 * @param prefix      e.g. "ord", "usr", etc.
 * @param model       Prisma model name (as key from prisma object)
 * @param field       Field name in the model to check (usually "uid", "orderUid", etc.)
 * @param length      Length of random part (default = 6)
 * @param maxAttempts Max retries before failing (default = 5)
 */
export const generateUID = async (
    prefix: string,
    model: keyof typeof prisma,
    field: string,
    length = 6,
    maxAttempts = 5
): Promise<string> => {
    for (let i = 0; i < maxAttempts; i++) {
        const random = crypto.randomBytes(Math.ceil(length / 2)).toString("hex").substring(0, length).toUpperCase();
        const uid = `${prefix}_${random}`;

        const exists = await (prisma[model] as any).findUnique({
            where: {
                [field]: uid,
            },
            select: {
                [field]: true,
            },
        });

        if (!exists) return uid;
    }

    throw new Error(`Failed to generate unique UID for ${prefix} after ${maxAttempts} attempts.`);
};