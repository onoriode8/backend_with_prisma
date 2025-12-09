import { User } from '@prisma/client'

import prisma from "../../config/prisma"



export const fetchUserPostsByUserId = async (userId: number): Promise<User | null> => {
    try {
        const user = await prisma.user.findUnique({ // add pagination on user posts later
            where: { id: userId },
            include: { posts: true }
        })
        
        user ? user.password = "" : null
        
        return user
    } catch(err) {
        return null
    }
} 