import cors from "cors"
import helmet from 'helmet'
import session from 'express-session'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import express, { Request, Response, NextFunction } from 'express'

import userRoutes from './src/routes/user-route'

const app = express()

app.use(express.json())
app.use(helmet())
app.use(compression())
app.use(cookieParser())

app.use(cors({
    origin: process.env.FRONTEND_URL, 
    credentials: true
}))

app.set("trust proxy", 1) // set if behind a proxy server, like AWS, Heroku, etc

app.use(session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    name: "sid",
    saveUninitialized: false,
    cookie: {
        secure: true, 
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        sameSite: "strict",
    }
}))

app.use("/user", userRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
    return res.status(404).json({ message: "Invalid page entered." });
})

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    return res.status(400).json("Something went wrong");
})

app.use((req: Request, res: Response, next: NextFunction) => {
    return res.status(400).json("Page not found.");
});


app.listen(process.env.PORT || 3000, () => {
    console.log(`app is launched.`);
});