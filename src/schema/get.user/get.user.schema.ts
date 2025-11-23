import { z } from 'zod'



export const GetUserSchema = {
    params: z.object({
        id: z.string()
    })
}


export type GetUserInput = z.infer<typeof GetUserSchema.params>