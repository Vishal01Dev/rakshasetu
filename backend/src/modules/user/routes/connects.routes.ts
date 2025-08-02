import { Router } from "express";
import { verifyLoggedUser } from "../../../middlewares/middleware";
import { createConnect, acceptConnect, rejectConnect } from "../controllers/connects.controller";


const router = Router();

router.use(verifyLoggedUser)

router.post("/create", createConnect);
router.post("/accept", acceptConnect)
router.post("/reject", rejectConnect);

export default router;