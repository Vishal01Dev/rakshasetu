import { z } from 'zod';
import { asyncHandler } from '../../../utils/asyncHandler';
import { uploadOnCloudinary } from '../../../utils/cloudinary';
import { handlegetAllConversations, handleGetConversationMessages, handleSendMessage } from '../services/conversation.service';

export const sendMessage = asyncHandler(async (req, res, next) => {
    try {

        const userId = req?.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        // Extract files first
        let mediaFiles: Express.Multer.File[] = [];

        if (Array.isArray(req.files)) {
            mediaFiles = req.files;
        } else if (req.files && Array.isArray(req.files['media'])) {
            mediaFiles = req.files['media'];
        }

        // Upload all files to Cloudinary
        let uploadedMedia: { url: string; type: string }[] = [];

        if (mediaFiles.length > 0) {
            const uploadPromises = mediaFiles.map(file =>
                uploadOnCloudinary(file.path, "rakshasetu/message-media")
            );

            const uploadResults = await Promise.all(uploadPromises);

            uploadedMedia = uploadResults
                .filter(result => result?.url)
                .map(result => ({
                    url: result!.url,
                    type: result!.resource_type || "raw", // raw, image, video, etc.
                }));
        }

        // Create custom schema with content and uploadedMedia
        const parsedData = z.object({
            content: z.string().optional(),
            conversationId: z.string(),
            senderId: z.string(),
        }).refine(
            data => {
                const hasContent = data.content && data.content.trim().length > 0;
                const hasMedia = uploadedMedia.length > 0;
                return hasContent || hasMedia;
            },
            {
                message: "Either message content or media is required",
                path: ["content"]
            }
        ).parse(req.body);

        const { content, conversationId, senderId } = parsedData;

        if (userId !== senderId) {
            return res.status(403).json({ success: false, message: "You are not allowed to send messages on behalf of another user" });
        }

        const message = await handleSendMessage(
            content,
            conversationId,
            senderId,
            uploadedMedia
        );

        res.status(201).json({ success: true, message: 'Message sent successfully' });
    } catch (err) {
        next(err);
    }
});


export const getAllConversations = asyncHandler(async (req, res, next) => {
    try {
        const userId = req?.user?.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const conversations = await handlegetAllConversations(userId);

        res.status(200).json({ success: true, data: conversations });


    } catch (err) {
        next(err);
    }
})

export const getConversationMessages = asyncHandler(async (req, res, next) => {

    try {

        const userId = req?.user?.id;
        const conversationId = req.params.conversationId;

        if (!userId || !conversationId) {
            return res.status(400).json({ success: false, message: "Unauthorized or missing conversationId" });
        }

        // Optional: Verify user is part of the conversation
        const messages = await handleGetConversationMessages(userId, conversationId);

        res.status(200).json({ success: true, data: messages });
    }
    catch (err) {
        next(err);
    }
});