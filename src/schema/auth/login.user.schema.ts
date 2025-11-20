import { z } from 'zod'



export const LoginUserSchema = {
    body: z.object({
        password: z.string().trim().min(5).max(30),
        userData: z.string().trim().min(4).max(30)
    })
}

export type LoginUserInput = z.infer<typeof LoginUserSchema.body>