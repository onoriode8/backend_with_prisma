import { Router } from 'express'

import AuthMiddleware from '../middleware/auth.middleware';
import { createUser, queryUser, getSingleUser } from '../controller/user-controller'
import { createPosts } from '../controller/post-controller';

const router = Router();


router.post("/create", AuthMiddleware, createUser);

router.get("/query", AuthMiddleware, queryUser);

router.get("/query/:id", getSingleUser);

router.post("/create/posts", AuthMiddleware, createPosts);

export default router;