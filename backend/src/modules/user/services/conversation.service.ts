import prisma from "../../../config/db";
import { AppError } from "../../../utils/AppError";
import { generateUID } from "../../../utils/generateUid";


export const handleSendMessage = async (content: string | undefined, conversationId: string, senderId: string, uploadedMedia: { url: string; type: string; }[] | undefined) => {
    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: true },
    });

    if (!conversation) {
        throw new AppError('Conversation not found', 404);
    }

    const messageId = await generateUID('msg', 'message', 'id', 8);

    const message = await prisma.message.create({
        data: {
            id: messageId,
            content: content ?? "",
            conversationId,
            senderId,

            media: uploadedMedia ? uploadedMedia : undefined,
        },
    });

    return message;
}

export const handlegetAllConversations = async (userId: string) => {

    const conversations = await prisma.conversation.findMany({
        where: {
            OR: [
                { userId },
                { sellerId: userId }
            ]
        },
        orderBy: { updatedAt: "desc" },
        include: {
            user: { select: { id: true, userName: true, image: true } },
            seller: { select: { id: true, userName: true, image: true } },
            listing: { select: { id: true, title: true } },
            messages: {
                take: 1,
                orderBy: { createdAt: 'desc' } // show last message
            }
        }
    });

    return conversations;
}


export const handleGetConversationMessages = async (userId: string, conversationId: string) => {
    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { userId: true, sellerId: true }
    });

    if (!conversation || (conversation.userId !== userId && conversation.sellerId !== userId)) {
        throw new AppError('Access denied to this conversation', 403);
    }

    const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        include: {
            sender: { select: { id: true, userName: true, image: true } }
        }
    });

    return messages;
}