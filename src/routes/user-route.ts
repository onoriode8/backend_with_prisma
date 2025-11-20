import { Router } from 'express'

import AuthMiddleware from '../middleware/auth/auth.middleware';
import { createPosts } from '../controller/post-controller';
import { LoginUserSchema } from '../schema/auth/login.user.schema'
import { CreateUserSchema } from '../schema/auth/create.user.schema'
import Validation from '../middleware/zod.validation/zod.validation.middleware'
import { createUser, LoginUser, queryUser, getSingleUser } from '../controller/user-controller'


const router = Router();


router.post("/create/user", Validation(CreateUserSchema), createUser);

router.post("/login/user", Validation(LoginUserSchema), LoginUser);

router.get("/query", AuthMiddleware, queryUser); // comment later or delete.

router.get("/query/:id", getSingleUser);

router.post("/create/posts", AuthMiddleware, createPosts);

export default router;