import bcryptjs from 'bcryptjs'
import { RequestHandler } from 'express'

import prisma from '../config/prisma'
import { CreateUserInput } from '../schema/auth/create.user.schema'
import { LoginUserInput } from '../schema/auth/login.user.schema'



// create new users.
export const createUser: RequestHandler<{}, {}, CreateUserInput> = async(req, res) => {
    const name = req.body.name
    const email = req.body.email
    const username = req.body.username
    const password = req.body.password

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

    let hashedPassword;
    try {
        hashedPassword = await bcryptjs.hash(password, 12);
    } catch (error) {
        return res.status(500).json("Something went wrong")
    }

    try {
        const user = await prisma.user.create({
            data: { name, email, username, password: hashedPassword }
        })
        user.password = "";
        return res.status(201).json(user)
    } catch (error) {
        return res.status(500).json("Something went wrong")
    }
}


export const LoginUser: RequestHandler<{}, {}, LoginUserInput> = async (req, res) => {
    const userData = req.body.userData
    const password = req.body.password
    
    let existingUser
    try {
        const [existingEmail, existingUsername] = await Promise.all([
            prisma.user.findUnique({
                where: { email: userData }
            }),
            prisma.user.findUnique({
                where: { username: userData }
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
        const isValid = await bcryptjs.compare(password, existingUser?.password as string)
        if(!isValid) return res.status(422).json("Invalid credential entered.");
        // existingUser.password = ""
        return res.status(200).json({ user: existingUser })
    } catch(err) {
        return res.status(500).json("Something went wrong.")
    }
}

export const queryUser: RequestHandler = async(req, res) => {
    try {
        const data = await prisma.user.findMany()
        return res.status(200).json(data)
    } catch(err: any) {
        return res.status(500).json("Something went wrong")
    }
}

export const getSingleUser: RequestHandler = async(req, res) => {
    const paramsId = req.params.id
    const userId = Number(paramsId)

    try {
        const user = await prisma.user.findFirst({
            where: { id: userId }
        })

        if(!user) return res.status(404).json("User not found.");

        return res.status(200).json(user)
    } catch(err: any) {
        return res.status(500).json("Something went wrong")
    }
}