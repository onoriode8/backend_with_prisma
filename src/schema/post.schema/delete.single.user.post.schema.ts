import { z } from 'zod'



export const DeleteSingleUserPostSchema = {
    params: z.object({
        userId: z.string(),
        postId: z.string()
    })
}

export type DeleteSingleUserPostType = z.infer<typeof DeleteSingleUserPostSchema.params>