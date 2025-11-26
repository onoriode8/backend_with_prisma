import { RequestHandler } from 'express'


import prisma from '../../config/prisma'
import { CreateProductParamsType, CreateProductBodyType } from '../../schema/product/create.product.schema'



export const createProduct: RequestHandler<CreateProductParamsType, {},  CreateProductBodyType, {}> = async (req, res) => {
    const userId = req.params.userId;
    const { price, quantity, productName } = req.body

    if(Number(userId) !== req.userData?.userId) {
        return res.status(401).json("Access Denied.")
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userData?.userId }
        });

        if(!user) {
            return res.status(404).json("User not found.")
        }

        const product = await prisma.products.create({
            data: {
                price, 
                quantity, 
                productName,
                creator: {
                    connect: {
                        id: user.id
                    }
                }
            },
            include: {
                creator: {
                    select: {
                        id: true, role: true,
                        name: true, email: true,
                        username: true
                    }
                }
            }
        })
        
        if(!product) {
            return res.status(400).json("Failed to create product.")
        }

        res.status(200).json(product)
    } catch(err) {
        console.error(err)
        return res.status(500).json("Something went wrong")
    }

}


export const queryUserProductById: RequestHandler<CreateProductParamsType, {}, {}, {}> = async (req, res) => {
    const userParams = req.params.userId
    const paramsUserId = Number(userParams)
    
    if(paramsUserId !== req.userData?.userId) {
        return res.status(401).json("Access Denied.")
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userData?.userId }
        });

        if(!user) {
            return res.status(404).json("User not found.")
        }

        const products = await prisma.products.findMany({
            where: { creatorId: user.id },
            include: {
                creator: {
                    select: {
                        id: true, 
                        name: true,
                        email: true, 
                        username: true
                    }
                }
            }
        })

        if(!products) {
            return res.status(400).json("Products not found.")
        }

        res.status(200).json(products)
    } catch(err) {
        return res.status(500).json("Something went wrong")
    }
}