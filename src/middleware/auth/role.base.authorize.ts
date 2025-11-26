import { Request, Response, NextFunction } from 'express'



const Authorize = (role: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.userData?.role ? req.userData.role : ""
        if(!role.includes(userRole)) {
            return res.status(400).json("Access Denied.");
        }

        next();
    }
}

export default Authorize;