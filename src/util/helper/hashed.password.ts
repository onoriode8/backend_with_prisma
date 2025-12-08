import bcryptjs from 'bcryptjs'
import { Request, Response } from 'express'



export const HashedRefreshToken = async (res: Response, refreshToken: string) => {
    try {
        const hashedRefreshedToken = await bcryptjs.hash(refreshToken, 12);

        return { hashedRefreshedToken }
    } catch(err) {
        return res.status(500).json("Something went wrong")
    }

}


export const HashedPassword = async (res: Response, password: string) => {

    try {
        const hashedPassword = await bcryptjs.hash(password, 12);

        return { hashedPassword }
    } catch (error) {
        return res.status(500).json("Something went wrong")
    }
}


export const compareHashedPassword = async(res: Response, password: string, existingPassword: string) => {
    try {
        const isValid = await bcryptjs.compare(password, existingPassword as string)

        if(!isValid) return res.status(422).json("Invalid credential entered.");
    } catch (error) {
        return res.status(500).json("Something went wrong")
    }
}


export const comparedHashedRefreshToken = async(req: Request, res: Response, userRefreshToken: string) => {
    try {
        const isValid = await bcryptjs.compare(userRefreshToken, req.cookies.refreshToken);

        if(!isValid) {
            return res.status(401).json("Unauthorize");
        }
    } catch(err) {
        return res.status(500).json("Something went wrong")
    }
}