import { Response } from "express"


export function AccessToken(response: Response, accessToken: string) {
    response.cookie("accessToken", accessToken, {
        secure: true,
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 15 // 15m     //1000 * 60 * 60 * 24 // 1day
    })
}


export function RefreshToken(response: Response, refreshToken: string) {
    response.cookie("refreshToken", refreshToken, {
        secure: true,
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7,
        path: "/user/get/data/api/access/token/expires"
    })
}


export const clearUserCookie = (res: Response, value: string, expires: number, path: string) => {
    res.clearCookie(value, {
        secure: true,
        httpOnly: true,
        sameSite: "strict",
        maxAge: expires,
        path: path
    })
}