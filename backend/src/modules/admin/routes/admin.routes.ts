import { Router } from "express";
import { upload } from "../../../middlewares/multer";
import { addAdminRolePermission, createAdmin, createAdminPermission, createAdminRole, updateAdmin } from "../controllers/admin.controller";
import { verifyLoggedAdmin } from "../../../middlewares/middleware";

const router = Router();

router.use(verifyLoggedAdmin)


router.post('/update-admin', upload.single('image'), updateAdmin)

router.post("/create-admin-role", upload.none(), createAdminRole)
router.post("/create-admin-permission", upload.none(), createAdminPermission)
router.post("/add-permission", upload.none(), addAdminRolePermission)
router.post("/create-admin", upload.none(), createAdmin)

export default router