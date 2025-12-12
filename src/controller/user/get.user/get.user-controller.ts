import bcryptjs from 'bcryptjs'
import { UAParser } from 'ua-parser-js'
import { RequestHandler } from 'express'
import jwt, { JwtPayload} from 'jsonwebtoken'

import prisma from '../../../config/prisma'
import { GetUserInput } from '../../../schema/get.user/get.user.schema'
import { AccessToken, clearUserCookie } from '../../../util/helper/set.cookie'
import { GetAllUserType } from '../../../schema/get.user/get.all.user.schema'
import { comparedHashedRefreshToken } from '../../../util/helper/hashed.password'
import { ParseDevice, checkDeviceSecurity } from '../../../util/helper/parse.device'
import { GetSingleUserPostType } from '../../../schema/post.schema/get.single.user.post.schema'
import { fetchUserByIdIncludingWhereLogin, updatedUserRefreshToken } from '../../../util/helper/fetch.user'
import { SignedAccessToken, decodedAccessTokenFromCookie, decodeRefreshTokenCookie } from '../../../util/helper/jwt_service'
import { accessTokenValue, refreshTokenValue, accessTokenExpires, refreshTokenExpires, accessTokenPath, refreshTokenPath } from '../../../util/helper/cookie.option'



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
    // console.log("SESSION", req.session)
    if(req.cookies.refreshToken === undefined) {
        const userId = Number(userParamsId)
        const user = await fetchUserByIdIncludingWhereLogin(userId)
        if(!user) {
            clearUserCookie(res, accessTokenValue, accessTokenExpires, accessTokenPath)
            clearUserCookie(res, refreshTokenValue, refreshTokenExpires, refreshTokenPath)
            
            return res.status(404).json("User not found.");
        }

        const RefreshedToken = ""
        await updatedUserRefreshToken(userId, RefreshedToken);

        clearUserCookie(res, refreshTokenValue, refreshTokenExpires, refreshTokenPath)
        clearUserCookie(res, accessTokenValue, accessTokenExpires, accessTokenPath)
    
        return res.status(401).json("Not Authenticated");
    }

    if(req.cookies.accessToken !== undefined) {
        return await decodedAccessTokenFromCookie(req, res, userParamsId, next);
    }
    
    const userId = decodeRefreshTokenCookie(req, res)
    
    try {
        const user = await fetchUserByIdIncludingWhereLogin(userId)

        if(!user) {
            return res.status(404).json("User not found.");
        }

        // const whereUserLogin = user ? user.whereLogin : []

        // checkDeviceSecurity(req, res, whereUserLogin);

        const refreshToken = user.refreshToken

        const isValid = await comparedHashedRefreshToken(req, refreshToken)

        if(!isValid) {
            return res.status(401).json("Unauthorize");
        }

        const userData = {
            id: user?.id,
            role: user?.role,
            name: user?.name,
            email: user?.email,
            username: user?.username
        }
        
        const { accessToken } = SignedAccessToken(userData);
        
        AccessToken(res, accessToken);

        res.status(200).json({ data: userData, message: "OK" });
    } catch(err) {
        return res.status(500).json("Something went wrong.");
    }
}