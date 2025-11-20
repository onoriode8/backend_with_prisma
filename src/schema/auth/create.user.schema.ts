import { z } from 'zod'


export const CreateUserSchema = {
    body: z.object({
        name: z.string().trim().min(4).max(30),
        username: z.string().trim().min(5).max(30),
        password: z.string().trim().min(5).max(30),
        email: z.email().normalize().trim().toLowerCase().min(12)
    })
}


export type CreateUserInput = z.infer<typeof CreateUserSchema.body>