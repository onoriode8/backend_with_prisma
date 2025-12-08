import { Response } from 'express';

import { User } from '@prisma/client';

import prisma from "../../config/prisma"




export const fetchUserByIdIncludingWhereLogin = async(userId: number): Promise<User | null> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {  whereLogin: true }
        })

        return user;
    } catch (error) {
        return null
    }
}


export const updatedUserRefreshToken = async(userId: number, hashedRefreshedToken: string): Promise<void> => {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { refreshToken: hashedRefreshedToken }
        })
    } catch (error) {
        throw error
    }
}