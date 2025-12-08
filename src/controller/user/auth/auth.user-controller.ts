import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { RequestHandler } from 'express'

import prisma from '../../../config/prisma'
import { clearUserCookie } from '../../../util/helper/set.cookie'
import { CreateUserInput } from '../../../schema/auth/create.user.schema'
import { LoginUserInput } from '../../../schema/auth/login.user.schema'
import { AccessToken, RefreshToken } from '../../../util/helper/set.cookie'
import { ParseDevice, checkDeviceSecurity } from '../../../util/helper/parse.device'
import { SignedAccessToken, SignedRefreshToken } from '../../../util/helper/jwt_service'
import { GetSingleUserPostType } from '../../../schema/post.schema/get.single.user.post.schema'
import { fetchUserByIdIncludingWhereLogin, updatedUserRefreshToken } from '../../../util/helper/fetch.user'
import { HashedPassword, HashedRefreshToken, compareHashedPassword } from '../../../util/helper/hashed.password'
import { accessTokenValue, refreshTokenValue, accessTokenExpires, refreshTokenExpires, accessTokenPath, refreshTokenPath } from '../../../util/helper/cookie.option'


// create new users.
export const createUser: RequestHandler<{}, {}, CreateUserInput> = async(req, res) => {
    const name = req.body.name
    const email = req.body.email
    const username = req.body.username
    const password = req.body.password
    
    const { result } = ParseDevice(req);

    let existingEmail
    try {
        existingEmail = await prisma.user.findUnique({
            where: { email }
        });
        
        if(existingEmail) {
            return res.status(409).json("User already exist.")
        }
    } catch(err: any) {
        return res.status(500).json("Something went wrong")
    }

    const hashedPassword = await HashedPassword(password)

    if(hashedPassword.length === 0) {
        return res.status(400).json("Failed to create user, Try again later.")
    }

    try {
        const user = await prisma.user.create({
            data: { 
                name, email, username, 
                role: "User", password: hashedPassword
            }
        })
        
        user.password = "";
        const { accessToken } = SignedAccessToken(user)

        if(!accessToken) {
            return res.status(400).json("Failed to create an account. Try again later")
        }
        const { refreshToken } = SignedRefreshToken(user)

        const hashedRefreshedToken = await HashedRefreshToken(refreshToken)

        const [ savedDevice, updatedUserRefreshToken ] = await Promise.all([
            prisma.whereLogin.create({
                data: {
                    device: result.device.model as string,  
                    OSVersion: result.os.version as string,
                    browser: result.browser.name as string, 
                    browserVersion: result.browser.version as string, 
                    creator: {
                        connect: {
                            id: user.id
                        }
                    }
                }
            }),
            prisma.user.update({
                where: { id: user.id },
                data: {
                    refreshToken: hashedRefreshedToken
                }
            })
        ])

        if(!savedDevice) {
            await prisma.user.delete({ where: { id: user.id } })
            return res.status(400).json("Failed to create details. Try again later.");
        }

        AccessToken(res, accessToken)
        RefreshToken(res, refreshToken)

        res.status(201).json({ userData: user })
    } catch (error) {
        return res.status(500).json("Something went wrong")
    }
}

// login user
export const LoginUser: RequestHandler<{}, {}, LoginUserInput> = async (req, res) => {
    const userData = req.body.userData
    const password = req.body.password
    
    const { result } = ParseDevice(req)
    
    let existingUser
    try {
        const [existingEmail, existingUsername] = await Promise.all([
            prisma.user.findUnique({
                where: { email: userData },
                include: { whereLogin: true }
            }),
            prisma.user.findUnique({
                where: { username: userData },
                include: { whereLogin: true }
            })
        ])
        if(!existingEmail && !existingUsername) {
            return res.status(404).json("User not found. Create an account instead.")
        }
        existingUser = existingEmail ? existingEmail : existingUsername
    } catch(err) {
        return res.status(500).json("Something went wrong.")
    }

    try {
        const existingPassword = existingUser ? existingUser?.password : ""
        await compareHashedPassword(res, password, existingPassword)

        existingUser ? existingUser.password = "" : existingUser

        const whereLogin = existingUser ? existingUser.whereLogin : []
        
        checkDeviceSecurity(req, res, whereLogin);

        const user = {
            id: existingUser?.id,
            role: existingUser?.role,
            name: existingUser?.name,
            email: existingUser?.email,
            username: existingUser?.username
        }

        const { accessToken } = SignedAccessToken(user)
        const { refreshToken } = SignedRefreshToken(user)
        
        if(!accessToken) {
            return res.status(400).json("Failed to create an account. Try again later")
        }
        
        AccessToken(res, accessToken)
        RefreshToken(res, refreshToken);

        const hashedRefreshedToken = await HashedRefreshToken(refreshToken);

        const userId = existingUser ? existingUser?.id : 0

        await updatedUserRefreshToken(userId, hashedRefreshedToken);

        res.status(200).json({ user: existingUser });
    } catch(err: any) {
        return res.status(500).json("Something went wrong.")
    }
}


export const logoutUser: RequestHandler<GetSingleUserPostType, {}, {}, {}> = async (req, res) => {
    const userParamsId = Number(req.params.userId);
    
    const user = await fetchUserByIdIncludingWhereLogin(userParamsId);
    if(!user) {
        return res.status(404).json("User not found.");
    }

    await updatedUserRefreshToken(user.id, "");

    clearUserCookie(res, accessTokenValue, accessTokenExpires, accessTokenPath)
    clearUserCookie(res, refreshTokenValue, refreshTokenExpires, refreshTokenPath)

    res.status(200).json("Logout successfully.")
}