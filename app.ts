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
app.use(cookieParser()) // helped to parsed incoming cookie.
app.use(cors({
    origin: 'http://localhost:5173', // add frontend url later
    credentials: true
}))

app.set("trust proxy", 1) // set if behind a proxy server, like AWS, Heroku, etc

app.use(session({
    // store: ,
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true, // set to true on production
        maxAge: 1000 * 60 * 60 * 24, // set expire time to 1 day
        httpOnly: true,
        sameSite: "strict",
    }
}))

app.use("/user", userRoutes);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    return res.status(400).json("Something went wrong");
})

app.use((req: Request, res: Response, next: NextFunction) => {
    return res.status(400).json("Page not found.");
});


app.listen(3000, () => {
    console.log(`app is launched.`);
});