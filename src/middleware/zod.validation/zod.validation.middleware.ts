import { ZodError } from 'zod'
import { Request, Response, NextFunction } from 'express'
import { Schema } from '../../util/types/zod.types'


const validation = (schema: Schema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if(schema.body) {
                const data = await schema.body.parseAsync(req.body)
                console.log("BODY_VALIDATION", data);
            }
            if(schema.query) {
                const data = await schema.query.parseAsync(req.query)
                console.log("QUERY_VALIDATION", data)
            }
            if(schema.params) {
                const data = await schema.params.parseAsync(req.params)
                console.log("PARAMS_VALIDATION", data)
            }
            next()
        } catch(err) {
            if(err instanceof ZodError) {
                for(let error of err.issues) {
                    const errorDetails = {
                        success: false,
                        path: error.path.join(""),
                        message: error.message.split(":")[0] || error.message
                    }
                    return res.status(400).json(errorDetails)
                }
            }
            return res.status(500).json("Something went wrong.");
        }
    }
}

export default validation;