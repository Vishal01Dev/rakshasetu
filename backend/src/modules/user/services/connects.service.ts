import { CONNECT_STATUS } from "@prisma/client";
import prisma from "../../../config/db";
import { AppError } from "../../../utils/AppError";
import { generateUID } from "../../../utils/generateUid";

export const handleCreateConnect = async (userId: string, listingId: string | undefined, sellerId: string, message: string | undefined) => {

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const seller = await prisma.user.findUnique({ where: { id: sellerId } });
    if (!seller) throw new AppError('Seller not found', 404);

    if (userId === sellerId) {
        throw new AppError('You cannot connect with yourself', 400);
    }

    const connectId = await generateUID('cnt', 'connects', 'id', 10);

    const newConnect = await prisma.connects.create({
        data: {
            id: connectId,
            userId,
            listingId,
            sellerId,
            status: CONNECT_STATUS.PENDING,
            message,
        },
    });

    return newConnect;

}


export const handleAcceptConnect = async (userId: string, connectId: string) => {

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);


    const checkConnect = await prisma.connects.findUnique({
        where: { id: connectId, sellerId: userId, status: CONNECT_STATUS.PENDING },
    });

    if (!checkConnect) {
        throw new AppError('Connect request not found or you are not authorized to accept it', 404);
    }

    if (userId !== checkConnect.sellerId) {
        throw new AppError('You are not authorized to accept this connect request', 403);
    }

    const connect = await prisma.connects.update({
        where: { id: connectId, sellerId: userId },
        data: { status: CONNECT_STATUS.ACCEPTED },
    });

    if (!connect) throw new AppError('Connect request not found or you are not authorized to accept it', 404);

    const conversationId = await generateUID('con', 'conversation', 'id', 10);

    await prisma.conversation.create({
        data: {
            id: conversationId,
            userId: connect.userId,
            sellerId: connect.sellerId,
            listingId: connect.listingId ? connect.listingId : undefined,
        },
    });

    return connect;

}
