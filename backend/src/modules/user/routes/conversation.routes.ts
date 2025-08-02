import { Router } from "express";
import { verifyLoggedUser } from "../../../middlewares/middleware";
import { upload } from "../../../middlewares/multer";
import { getAllConversations, getConversationMessages, sendMessage } from "../controllers/conversation.controller";

const router = Router();

router.use(verifyLoggedUser)

router.get("/", getAllConversations)
router.post("/send", upload.array('media', 5), sendMessage);
router.get("/:conversationId/messages", getConversationMessages);


export default router;