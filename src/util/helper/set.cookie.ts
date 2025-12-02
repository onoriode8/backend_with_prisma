import { Response } from "express"


export function AccessToken(response: Response, accessToken: string) {
    response.cookie("accessToken", accessToken, {
        secure: false,
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 // 1day
    })
}


export function RefreshToken(response: Response, refreshToken: string) {
    response.cookie("refreshToken", refreshToken, {
        secure: false,
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7days
        path: "/user/get/data/api/refresh"
    })
}