
import z from 'zod'

export const createAdminRoleSchema = z.object({
    name: z.string().min(1, 'Role name is required'),
    description: z.string().optional(),
})

export const createAdminPermissionSchema = z.object({
    name: z
        .string()
        .min(1, 'Permission name is required')
        .regex(/^[A-Z_]+$/, {
            message: 'Permission name must be in UPPER_CASE_WITH_UNDERSCORES only',
        }),
    label: z.string().optional(),
})

export const createAdminSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    roleId: z.string()
})

export const updateAdminSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    userName: z.string().min(3).max(20),
    email: z.string().email(),
})