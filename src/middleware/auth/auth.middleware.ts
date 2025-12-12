import { RequestHandler } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken'

import prisma from '../../config/prisma';


export const AuthMiddleware: RequestHandler = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken;
        if(!token) {
            return res.status(400).json("Token not provided.")
        }
        const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as JwtPayload
        if(!decodedToken) {
            return res.status(400).json("Not allowed.")
        }
        const user = await prisma.user.findUnique({
            where: { id: decodedToken.userId }
        });

        if(!user) {
            return res.status(401).json("Unauthorize access")
        }

        req.userData = {
            name: decodedToken.name,
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

export const generateAccessTokenWhenAccessTokenExpires: RequestHandler = async (req, res, next) => {

     try {
        const decodedToken = jwt.verify(req.cookies.refreshToken, process.env.JWT_REFRESH_SECRET as string) as JwtPayload
         if(!decodedToken) {
            return res.status(400).json("Not allowed.")
        }
        const user = await prisma.user.findUnique({
            where: { id: decodedToken.userId }
        });

        if(!user) {
            return res.status(401).json("Unauthorize access")
        }

        const accessToken = jwt.sign({ userId: user.id, role: user.role,
                email: user.email, username: user.username }, 
                process.env.JWT_REFRESH_SECRET as string, { expiresIn: "7d" })

        next();
    } catch(err) {
        return res.status(500).json("Something went wrong.")
    }
}