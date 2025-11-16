import { RequestHandler } from 'express'


import prisma from '../config/prisma'



export const createPosts: RequestHandler = async(req, res) => {
    const title = req.body.title as string
    const paramId = req.params.id as string
    const description = req.body.description as string

    const userId = Number(paramId)
    try {
        const user = await prisma.user.findFirst({
            where: { id: userId }
        })

        if(!user) {
            return res.status(404).json("User not found to create a post.")
        }

        const post = await prisma.posts.create({
            data: { title, description }
        })
    } catch(err) {
        return res.status(500).json("Something went wrong.")
    }
}