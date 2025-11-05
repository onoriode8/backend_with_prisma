import { RequestHandler } from 'express'

import prisma from '../config/prisma'


export const createUser: RequestHandler = async(req, res) => {
    const name = req.body.name as string
    const email = req.body.email as string
    const username = req.body.username as string

    try {
        const existingEmail = await prisma.user.findUnique({
            where: { username }
        });
        
        if(existingEmail) {
            return res.status(409).json("User already exist.")
        }

        const user = await prisma.user.create({
            data: { name, email, username }
        })
        
        return res.status(201).json(user)
    } catch(err: any) {
        return res.status(500).json("Something went wrong")
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