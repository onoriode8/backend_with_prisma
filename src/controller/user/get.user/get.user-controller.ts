import { RequestHandler } from 'express'

import prisma from '../../../config/prisma'
import { GetUserInput } from '../../../schema/get.user/get.user.schema'
import { GetAllUserType } from '../../../schema/get.user/get.all.user.schema'



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
        const user = await prisma.user.findFirst({
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