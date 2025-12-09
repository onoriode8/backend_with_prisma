import { RequestHandler } from 'express'


import prisma from '../../config/prisma'
import { fetchUserPostsByUserId } from '../../util/helper/fetch.post'
import { GetSingleUserPostType } from '../../schema/post.schema/get.single.user.post.schema'
import { DeleteSingleUserPostType } from '../../schema/post.schema/delete.single.user.post.schema'
import { CreatePostBodyType, CreatePostParamsType  } from '../../schema/post.schema/create.post.schema'
import { UpdateSingleUserPostParamType, UpdateSingleUserPostBodyType } from '../../schema/post.schema/update.single.user.post.schema'


export const createPosts: RequestHandler<CreatePostParamsType, {}, CreatePostBodyType, {}> = async(req, res) => {
    const title = req.body.title
    const paramId = req.params.userId
    const description = req.body.description

    const userId = Number(paramId)
    try {
        const user = await prisma.user.findFirst({
            where: { id: userId }
        })
        
        if(!user) {
            return res.status(404).json("User not found to create a post.")
        }
        const post = await prisma.posts.create({
            data: { 
                title, 
                description, 
                creatorId: user.id, 
                // creator: { 
                //     connect: { id: user.id }
                // }
            },
            include: {
                creator: {
                    select: { id: true, name: true, email: true, username: true, password: false }
                }
            }
        })
        
        return res.status(200).json(post)
    } catch(err) {
        return res.status(500).json("Something went wrong.")
    }
}


export const GetSingleUserPosts: RequestHandler<GetSingleUserPostType, {}, {}, {}> = async (req, res) => {
    const userParams = req.params.userId;
    const userId = Number(userParams)

    const user = await fetchUserPostsByUserId(userId);

    if(!user) return res.status(404).json("User not found");

    user.password = ""

    res.status(200).json(user)
}


export const updateSingleUserPost: RequestHandler<UpdateSingleUserPostParamType, {}, UpdateSingleUserPostBodyType, {}> = async (req, res) => {
    const userParams = req.params.userId;
    const userId = Number(userParams)

    const postParams = req.params.postId;
    const postId = Number(postParams)

    const title = req.body.title
    const description = req.body.description

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { posts: true }
        })

        if(!user) return res.status(404).json("User not found")
            
        const filteredUserPost = user.posts.filter(p => p.id === postId)
        if(filteredUserPost.length === 0) {
            return res.status(401).json("Not allowed.")
        }
        const mapPost = filteredUserPost.flatMap(p => p.title === title && p.description === description);
        const stringValue = mapPost.join("")
        if(stringValue === "true") {
            return res.status(409).json({
                success: false,
                error: "Conflict. Resource already exist.",
                message: "Information already exist, please provide new information on title and description."
            })
        }
        const post = await prisma.posts.update({
            where: { id: postId },
            data: { title, description },
            include: {  creator: {
                    select: { id: true, name: true, email: true, username: true }
                }
            }
        })

        res.status(200).json(post)
    } catch(err) {
        return res.status(500).json("Something went wrong.")
    }
}


export const deleteSingleUserPost: RequestHandler<DeleteSingleUserPostType, {}, {}, {}> = async(req, res) => {
    const userParams = req.params.userId;
    const userId = Number(userParams)

    const postParams = req.params.postId;
    const postId = Number(postParams)

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { posts: true }
        })
        if(!user) return res.status(404).json("User not found")

        const filteredUserPost = user.posts.filter(p => p.id === postId)
        if(filteredUserPost.length === 0) {
            return res.status(401).json("Not allowed.")
        }
        console.log("FILTERED-POST", filteredUserPost)
        const deletedPost = await prisma.posts.delete({
            where: { id: postId }
        })
        res.status(200).json(deletedPost)
    } catch(err) {
        return res.status(500).json("Something went wrong.")
    }
}