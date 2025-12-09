import 'dotenv/config'
import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

import prisma from '../../config/prisma'


interface UserProps {
    id: number | undefined,
    role: string | undefined,
    name: string | undefined,
    email: string | undefined,
    username: string | undefined
}

export const SignedAccessToken = (user: UserProps) => {
    const accessToken = jwt.sign({ 
        userId: user.id, role: user.role, name: user.name,
        email: user.email, username: user.username }, 
        process.env.JWT_ACCESS_SECRET as string, { expiresIn: "15m" });
    
    return { accessToken }
}



export const SignedRefreshToken = (user: UserProps) => {
    
    const refreshToken = jwt.sign({ 
        userId: user.id, role: user.role, name: user.name,
        email: user.email, username: user.username }, 
        process.env.JWT_REFRESH_SECRET as string, { expiresIn: "7d" });

    return { refreshToken }
}


export const decodeRefreshTokenCookie = (req: Request, res: Response) => {
    try {
        
        const decodedUser = jwt.verify(req.cookies.refreshToken, 
            process.env.JWT_REFRESH_SECRET as string) as JwtPayload;
        if(!decodedUser) {
            return res.status(401).json("Not authorized.")
        }
        const userId = decodedUser.userId
        return userId
    } catch (error: any) {
        if(error.message === "invalid signature") {
            return res.status(401).json("Unauthorize user")
        }

        return res.status(500).json("Something went wrong.")
    }
}


export const decodedAccessTokenFromCookie = async (req: Request, res: Response, userParamsId: string, next: NextFunction) => {
    try {
        const decodedToken = jwt.verify(req.cookies.accessToken, process.env.JWT_ACCESS_SECRET as string) as JwtPayload
        if(!decodedToken) {
            return res.status(400).json("Not allowed.")
        }
        
        const user = await prisma.user.findUnique({
            where: { id: decodedToken.userId }
        });

        if(!user) {
            return res.status(401).json("Unauthorize access")
        }

        if(Number(decodedToken.userId) !== Number(userParamsId)) {
            return res.status(403).json("Forbidden");
        }

        return res.status(200).json({ data: decodedToken });
    } catch(err: any) {
        if(err.message === "jwt expired") {
            return res.status(401).json("Access Token expired.")
        }

        return res.status(500).json("Something went wrong");
    }
}