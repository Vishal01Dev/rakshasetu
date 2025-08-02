import prisma from "../../../config/db"
import bcrypt from 'bcryptjs'
import { generateUniqueUsername } from "../../../utils/generateUniqueUsername";
import { AppError } from "../../../utils/AppError";
import { generateUID } from "../../../utils/generateUid";

export const handleCreateAdminRole = async (name: string, description?: string) => {

    const existingRole = await prisma.adminRole.findUnique({
        where: {
            name: name,
        }
    });

    if (existingRole) {
        throw new Error('Role with this name already exists');
    }

    const adminRoleId = await generateUID('ar', 'adminRole', 'id', 8)

    const adminRole = await prisma.adminRole.create({
        data: {
            id: adminRoleId,
            name,
            description: description || '',
        }
    })

    if (!adminRole) {
        throw new Error('Failed to create admin role');
    }

    return adminRole;

}

export const handleCreateAdminPermission = async (name: string, label?: string) => {

    const existingPermission = await prisma.adminPermission.findUnique({
        where: {
            name: name,
        }
    });

    if (existingPermission) {
        throw new Error('Permission with this name already exists');
    }

    const adminPermissionId = await generateUID('ap', 'adminPermission', 'id', 8)

    const adminPermission = await prisma.adminPermission.create({
        data: {
            id: adminPermissionId,
            name,
            label: label || '',
        }
    })

    if (!adminPermission) {
        throw new Error('Failed to create admin permission');
    }

    return adminPermission;
}

export const handleAddRolePermission = async (roleId: string, permissionId: string) => {
    const role = await prisma.adminRole.findUnique({ where: { id: roleId } });
    if (!role) throw new Error('Role not found');

    const permission = await prisma.adminPermission.findUnique({ where: { id: permissionId } });
    if (!permission) throw new Error('Permission not found');

    // Check if this specific permission is already assigned to the role
    const exists = await prisma.adminRole.findFirst({
        where: {
            id: roleId,
            permissions: {
                some: {
                    id: permissionId,
                },
            },
        },
    });

    if (exists) throw new Error('Permission already exists for this role');

    const updatedRole = await prisma.adminRole.update({
        where: { id: roleId },
        data: {
            permissions: {
                connect: { id: permissionId },
            },
        },
        include: {
            permissions: true,
        },
    });

    return updatedRole;
};

export const handleCreateAdmin = async (email: string, firstName: string, lastName: string, password: string, roleId: string) => {

    const adminExist = await prisma.admin.findUnique({
        where: {
            email,
        }
    })

    if (adminExist) {
        throw new Error("This email is already exists.")
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userName = await generateUniqueUsername(firstName, lastName);


    const role = await prisma.adminRole.findUnique({ where: { id: roleId } });


    if (!role) {
        throw new Error("Admin role does not exist.");
    }

    const adminId = await generateUID('ad', 'admin', 'id', 8)

    const admin = await prisma.admin.create({
        data: {
            id: adminId,
            email,
            firstName, lastName, password: hashedPassword, userName,
            role: {
                connect: { id: roleId },
            },
        }
    })

    return admin;

}


export const handleUpdateAdmin = async (adminId: string,
    adminData: {
        firstName?: string;
        lastName?: string;
        userName?: string;
        email?: string;
        image?: string;
    }
): Promise<void> => {
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) throw new AppError('Admin not found', 404);

    const updatedData = {
        ...adminData,
    };

    await prisma.admin.update({
        where: { id: admin.id },
        data: updatedData,
    });

}