import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { RequestHandler } from 'express'

import prisma from '../../../config/prisma'
import { CreateUserInput } from '../../../schema/auth/create.user.schema'
import { LoginUserInput } from '../../../schema/auth/login.user.schema'



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
        // console.log(err)
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
            data: { 
                name, 
                email, 
                username, 
                role: "User", 
                password: hashedPassword 
            }
        })
        user.password = "";
        const token = jwt.sign({ 
            userId: user.id, role: user.role,
            email: user.email, 
            username: user.username }, 
            process.env.JWT_SECRET as string, { expiresIn: "24hr"})
        if(!token) {
            return res.status(400).json("Failed to create an account. Try again later")
        }
        
        res.status(201).json({ userData: user, token: token })
    } catch (error) {
        return res.status(500).json("Something went wrong")
    }
}

// login user
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
        existingUser ? existingUser.password = "" : existingUser
        const token = jwt.sign({ 
            userId: existingUser?.id, role: existingUser?.role,
            email: existingUser?.email, 
            username: existingUser?.username }, 
            process.env.JWT_SECRET as string, { expiresIn: "24hr"})
        if(!token) {
            return res.status(400).json("Failed to create an account. Try again later")
        }
        
        res.status(200).json({ user: existingUser, token })
    } catch(err) {
        return res.status(500).json("Something went wrong.")
    }
}