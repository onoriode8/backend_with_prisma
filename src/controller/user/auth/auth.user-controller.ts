import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { RequestHandler } from 'express'

import prisma from '../../../config/prisma'
import { CreateUserInput } from '../../../schema/auth/create.user.schema'
import { LoginUserInput } from '../../../schema/auth/login.user.schema'
import { AccessToken, RefreshToken } from '../../../util/helper/set.cookie'
import { ParseDevice, checkDeviceSecurity } from '../../../util/helper/parse.device'
import { SignedAccessToken, SignedRefreshToken } from '../../../util/helper/jwt_service'
import { HashedPassword, HashedRefreshToken, compareHashedPassword } from '../../../util/helper/hashed.password'




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

    const hashedPassword = await HashedPassword(res, password)

    console.log("OMO SEE OH", hashedPassword) // check

    try {
        const user = await prisma.user.create({
            data: { 
                name, email, username, 
                role: "User", password: "" //hashedPassword // check 
            }
        })
        
        user.password = "";
        const { accessToken } = SignedAccessToken(user)
        console.log("access", accessToken)
        if(!accessToken) {
            return res.status(400).json("Failed to create an account. Try again later")
        }
        const { refreshToken } = SignedRefreshToken(user)
        console.log("refresh", refreshToken)

        const hashedRefreshedToken = await HashedRefreshToken(res, refreshToken)
        console.log("HASHED-REFRESH-TOKEN", hashedRefreshedToken)
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
                    refreshToken: "" //hashedRefreshedToken
                }
            })
        ])

        if(!savedDevice) {
            await prisma.user.delete({ where: { id: user.id } })
            return res.status(400).json("Failed to create details. Try again later.");
        }

        AccessToken(res, accessToken)
        RefreshToken(res, refreshToken)

        res.status(201).json({ userData: user, accessToken })
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

        checkDeviceSecurity(req, whereLogin);

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

        const hashedRefreshedToken = await HashedRefreshToken(res, refreshToken);
        console.log("HASHED-REFRESH-TOKEN- INSIDE LOGIN CONTROLLER LINE 151", hashedRefreshedToken)
        const userId = existingUser ? existingUser?.id : 0
        // await prisma.user.update({
        //     where: { id: userId },
        //     data: { refreshToken: hashedRefreshedToken }
        // })

        res.status(200).json({ user: existingUser, accessToken });
    } catch(err: any) {
        return res.status(500).json("Something went wrong.")
    }
}