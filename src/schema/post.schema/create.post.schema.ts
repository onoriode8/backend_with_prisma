import { z } from 'zod'


// create post params
export const CreatePostParamsSchema = {
    params: z.object({
        userId: z.string()
    })
}

export type CreatePostParamsType = z.infer<typeof CreatePostParamsSchema.params>


// create post body
export const CreatePostBodySchema = {
    body: z.object({
        // creatorId: z.number(),
        title: z.string().trim().min(4).max(50),
        description: z.string().trim().min(5).max(100)
    })
}


export type CreatePostBodyType = z.infer<typeof CreatePostBodySchema.body>