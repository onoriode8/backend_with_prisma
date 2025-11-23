import { z } from 'zod'



export const UpdateSingleUserPostParamSchema = {
    params: z.object({
        userId: z.string(),
        postId: z.string()
    })
}


export type UpdateSingleUserPostParamType = z.infer<typeof UpdateSingleUserPostParamSchema.params>


export const UpdateSingleUserPostBodySchema = {
    body: z.object({
        title: z.string().trim().min(4).max(30),
        description: z.string().trim().min(5).max(100)
    })
}


export type UpdateSingleUserPostBodyType = z.infer<typeof UpdateSingleUserPostBodySchema.body>