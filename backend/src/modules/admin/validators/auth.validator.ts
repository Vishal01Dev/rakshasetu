import z from 'zod'

export const adminLoginSchema = z.object({
    emailOrUsername: z.string().email(),
    password: z.string().min(6)
})