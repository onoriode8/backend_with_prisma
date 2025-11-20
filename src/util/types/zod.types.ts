import { z } from 'zod'


export type Schema = {
    body?: z.ZodType,
    query?: z.ZodType,
    params?: z.ZodType
}