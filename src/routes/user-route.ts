import { Router } from 'express'

import AuthMiddleware from '../middleware/auth.middleware';
import { createUser, queryUser, getSingleUser } from '../controller/user-controller'

const router = Router();


router.post("/create", AuthMiddleware, createUser);

router.get("/query", AuthMiddleware, queryUser)

router.get("/query/:id", getSingleUser)



export default router;