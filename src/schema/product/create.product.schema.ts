import { z } from 'zod'



export const CreateProductParamsSchema = {
    params: z.object({
        userId: z.string()
    })
}


export const CreateProductBodySchema = {
    body: z.object({
        price: z.number(),
        quantity: z.number(),
        productName: z.string()
    })
}

export type CreateProductParamsType = z.infer<typeof CreateProductParamsSchema.params>

export type CreateProductBodyType = z.infer<typeof CreateProductBodySchema.body>