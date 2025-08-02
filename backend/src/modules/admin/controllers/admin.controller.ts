import { AppError } from "../../../utils/AppError";
import { asyncHandler } from "../../../utils/asyncHandler";
import { uploadOnCloudinary } from "../../../utils/cloudinary";
import { handleAddRolePermission, handleCreateAdmin, handleCreateAdminPermission, handleCreateAdminRole, handleUpdateAdmin } from "../services/admin.service";
import { createAdminPermissionSchema, createAdminRoleSchema, createAdminSchema } from "../validators/admin.validator";

export const createAdmin = asyncHandler(async (req, res, next) => {
    try {

        const { email, firstName, lastName, password, roleId } = createAdminSchema.parse(req.body)

        const admin = await handleCreateAdmin(email, firstName, lastName, password, roleId)

        res.status(201).json({ message: 'Admin created successfully', data: admin });

    } catch (err) {
        next(err)
    }
})


export const createAdminRole = asyncHandler(async (req, res, next) => {

    try {

        const { name, description } = createAdminRoleSchema.parse(req.body);

        const role = await handleCreateAdminRole(name, description);

        res.status(201).json({ message: 'Role created successfully', data: role });

    } catch (err) {
        next(err);
    }

})

export const createAdminPermission = asyncHandler(async (req, res, next) => {
    try {

        const { name, label } = createAdminPermissionSchema.parse(req.body);


        const permission = await handleCreateAdminPermission(name, label);

        res.status(201).json({ message: 'Permission created successfully', data: permission });


    } catch (err) {
        next(err);
    }
})


export const addAdminRolePermission = asyncHandler(async (req, res, next) => {
    try {
        const { roleId, permissionId } = req.body;

        if (!roleId || !permissionId) {
            throw new AppError('role and permission is required', 400);
        }

        await handleAddRolePermission(roleId, permissionId);

        res.status(200).json({ message: 'Permission added to role successfully' });

    } catch (err) {
        next(err)
    }
})

export const updateAdmin = asyncHandler(async (req, res, next) => {
    try {

        const adminId = req?.admin?.id;

        if (!adminId) {
            return res.status(400).json({ success: false, message: "Not authorized" });
        }

        const adminData = req.body;
        const image = req.file ? req.file.path : undefined;

        let imageUrl = "";

        if (image) {
            const uploadResult = await uploadOnCloudinary(image, "rakshasetu/admin-images");

            if (!uploadResult) {
                return res.status(500).json({ success: false, message: "Failed to upload image" });
            }

            imageUrl = uploadResult?.url ?? "";
        }

        await handleUpdateAdmin(adminId, { ...adminData, image: imageUrl || undefined });

        res.status(200).json({ success: true, message: "Admin updated successfully" });

    } catch (err) {
        next(err)
    }
})