import { RequestHandler } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken'

// import Users from '../'


const AuthMiddleware: RequestHandler = (req, res, next) => {
    try {
        // const token = req.headers.authorization?.split(" ")[1];
        // if(!token) {
        //     return res.status(400).json("Token not provided.")
        // }
        // const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload
        // if(!decodedToken) {
        //     return res.status(400).json("Token not provided.")
        // }
        // // Users.
        req.userData = {
            id: 123,
            name: "PrismaPractice"
        }
        next()
    } catch(err: any) {
        console.error(err.message)
    }
}

export default AuthMiddleware;