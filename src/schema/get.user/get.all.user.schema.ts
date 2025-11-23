import { z } from 'zod'



export const GetAllUserSchema = {
    params: z.object({
        userId: z.string().nonempty()
    })
}


export type GetAllUserType = z.infer<typeof GetAllUserSchema.params>