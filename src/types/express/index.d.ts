import 'express';


declare module 'express-serve-static-core' {
    interface Request {
        userData?: {
            id: number,
            name: string
        }
    }
}