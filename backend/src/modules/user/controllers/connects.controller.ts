import { CONNECT_STATUS } from "@prisma/client";
import prisma from "../../../config/db";
import { asyncHandler } from "../../../utils/asyncHandler";
import { handleAcceptConnect, handleCreateConnect } from "../services/connects.service";
import { acceptConnectSchema, connectSchema, rejectConnectSchema } from "../validators/connects.validator";

export const createConnect = asyncHandler(async (req, res, next) => {
    try {

        const userId = req?.user?.id;
        const { listingId, sellerId, message } = connectSchema.parse(req.body);

        if (!userId || !sellerId) {
            return res.status(400).json({ success: false, message: "User ID and Seller ID are required" });
        }

        const connect = await handleCreateConnect(userId, listingId, sellerId, message);

        res.status(201).json({ success: true, data: connect, message: "Connect request created successfully" });

    } catch (err) {
        next(err);
    }
})

export const acceptConnect = asyncHandler(async (req, res, next) => {
    try {

        const userId = req?.user?.id;

        const { connectId } = acceptConnectSchema.parse(req.body);

        if (!userId || !connectId) {
            return res.status(400).json({ success: false, message: "User ID and Connect ID are required" });
        }

        

        const connect = await handleAcceptConnect(userId, connectId);

        res.status(200).json({ success: true, data: connect, message: "Connect request accepted successfully" });

    } catch (err) {
        next(err);
    }
})


export const rejectConnect = asyncHandler(async (req, res, next) => {
    try {

        const userId = req?.user?.id;

        const { connectId, rejectReason } = rejectConnectSchema.parse(req.body);

        if (!userId || !connectId) {
            return res.status(400).json({ success: false, message: "User ID and Connect ID are required" });
        }

        const checkConnect = await prisma.connects.findUnique({
            where: { id: connectId, sellerId: userId, status: CONNECT_STATUS.ACCEPTED },
        });

        if (checkConnect) {
            return res.status(400).json({ success: false, message: "You cannot reject an accepted connect request" });
        }

        const connect = await prisma.connects.update({
            where: { id: connectId, sellerId: userId },
            data: { status: CONNECT_STATUS.REJECTED, rejectReason },
        });

        res.status(200).json({ success: true, data: connect, message: "Connect request rejected successfully" });

    } catch (err) {
        next(err);
    }
})