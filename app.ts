import express, { Request, Response, NextFunction } from 'express'

import userRoutes from './src/routes/user-route'


const app = express()

app.use(express.json())

app.use("/user", userRoutes);


app.use((req: Request, res: Response, next: NextFunction) => {
    return res.status(400).json("Page not found.");
});


app.listen(3000, () => {
    console.log(`app is launch on http://localhost:3000`);
});