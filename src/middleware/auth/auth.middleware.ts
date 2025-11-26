import { RequestHandler } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken'

import prisma from '../../config/prisma';


const AuthMiddleware: RequestHandler = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if(!token) {
            return res.status(400).json("Token not provided.")
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload
        if(!decodedToken) {
            return res.status(400).json("Token not provided.")
        }
        const user = await prisma.user.findUnique({
            where: { id: decodedToken.userId }
        });

        if(!user) {
            return res.status(401).json("Unauthorize access")
        }

        req.userData = {
            role: decodedToken.role,
            userId: decodedToken.userId,
            email: decodedToken.email,
            username: decodedToken.username
        }
        
        next();
    } catch(err: any) {
        if(err.message === "invalid signature") {
            return res.status(401).json("Unauthorize user")
        }
        return res.status(500).json("Something went wrong.")
    }
}


export default AuthMiddleware;