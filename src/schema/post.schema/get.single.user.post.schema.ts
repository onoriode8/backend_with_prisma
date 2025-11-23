import { z } from 'zod'



export const GetSingleUserPostSchema = {
    params: z.object({
        userId: z.string()
    })
}


export type GetSingleUserPostType = z.infer<typeof GetSingleUserPostSchema.params>