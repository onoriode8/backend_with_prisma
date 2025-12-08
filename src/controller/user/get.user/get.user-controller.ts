import bcryptjs from 'bcryptjs'
import { UAParser } from 'ua-parser-js'
import { RequestHandler } from 'express'
import jwt, { JwtPayload} from 'jsonwebtoken'

import prisma from '../../../config/prisma'
import { GetUserInput } from '../../../schema/get.user/get.user.schema'
import { AccessToken, clearUserCookie } from '../../../util/helper/set.cookie'
import { GetAllUserType } from '../../../schema/get.user/get.all.user.schema'
import { comparedHashedRefreshToken } from '../../../util/helper/hashed.password'
import { fetchUserByIdIncludingWhereLogin } from '../../../util/helper/fetch.user'
import { ParseDevice, checkDeviceSecurity } from '../../../util/helper/parse.device'
import { GetSingleUserPostType } from '../../../schema/post.schema/get.single.user.post.schema'
import { SignedAccessToken, decodedAccessTokenFromCookie, decodeRefreshTokenCookie } from '../../../util/helper/jwt_service'



export const queryAllUser: RequestHandler<GetAllUserType, {}, {}, {}> = async(req, res) => {
    const paramsId = req.params.userId
    const userId = Number(paramsId);

    try {
        const user = await prisma.user.findFirst({
            where: { id: userId }
        })
        if(!user) return res.status(404).json("User not found")
        const data = await prisma.user.findMany()
        let filteredUser = []
        for(let loopUser of data) {
            filteredUser.push({
                name: loopUser.name,
                email: loopUser.email,
                username: loopUser.username,
                password: ""
            })
        }
        return res.status(200).json(filteredUser)
    } catch(err: any) {
        return res.status(500).json("Something went wrong")
    }
}



export const getSingleUser: RequestHandler<GetUserInput, {}, {}, {}> = async(req, res) => {
    const paramsId = req.params.id
    const userId = Number(paramsId);

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {  posts: true }
        })

        if(!user) return res.status(404).json("User not found.");
        user.password = ""
        return res.status(200).json(user)
    } catch(err: any) {
        return res.status(500).json("Something went wrong")
    }
}


export const GetUserDataWhenAccessTokenExpires: RequestHandler<GetSingleUserPostType, {}, {}, {}> = async (req, res, next) => {
    const paramsId = req.params.userId;
    const userParamsId = paramsId

    const { result } = ParseDevice(req)

    if(req.body !== undefined) {
        return res.status(422).json("Invalid information.");
    }

    if(req.cookies.refreshToken === undefined) {
        // use userId or token to clear user refreshToken from the server and db and leave it an empty string, until real user login.
        const refreshTokenValue = "refreshToken"
        const refreshTokenExpires = 1000 * 60 * 60 * 24 * 7
        const refreshTokenPath = "/user/get/data/api/access/token/expires/"
        clearUserCookie(res, refreshTokenValue, refreshTokenExpires, refreshTokenPath)

        const accessTokenValue = "accessToken"
        const accessTokenExpires = 1000 * 60 * 60 * 24
        const accessTokenPath = "/"
        clearUserCookie(res, accessTokenValue, accessTokenExpires, accessTokenPath)
        
        // console.log("IN")
    
        return res.status(401).json("Not Authenticated");
    }

    if(req.cookies.accessToken !== undefined) {
        return await decodedAccessTokenFromCookie(req, res, userParamsId, next);
    } 
    
    // console.log("REACH")
    
    const userId = decodeRefreshTokenCookie(req, res)
    
    try {
        const user = await fetchUserByIdIncludingWhereLogin(userId)

        if(!user) {
            return res.status(404).json("User not found.");
        }

        // console.log("BIG USER", user)

        // const whereUserLogin = user?.whereLogin 

        // checkDeviceSecurity(req, whereUserLogin);

        const refreshToken = user.refreshToken

        await comparedHashedRefreshToken(req, res, refreshToken)

        const userData = {
            id: user?.id,
            role: user?.role,
            name: user?.name,
            email: user?.email,
            username: user?.username
        }
        
        const { accessToken } = SignedAccessToken(userData);
        
        AccessToken(res, accessToken);

        res.status(200).json({ message: "OK" });
    } catch(err) {
        return res.status(500).json("Something went wrong.");
    }
}