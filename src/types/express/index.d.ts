import 'express';


declare module 'express-serve-static-core' {
    interface Request {
        userData?: {
            name: string,
            role: string,
            userId: number,
            email: string,
            username: string
        }
    }
}