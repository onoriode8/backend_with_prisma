import { Router } from 'express'

import AuthMiddleware from '../middleware/auth/auth.middleware';
import { LoginUserSchema } from '../schema/auth/login.user.schema'
import { GetUserSchema } from '../schema/get.user/get.user.schema'
import { CreateUserSchema } from '../schema/auth/create.user.schema'
import RoleBaseAuthorize from '../middleware/auth/role.base.authorize'
import { GetAllUserSchema } from '../schema/get.user/get.all.user.schema'
import Validation from '../middleware/zod.validation/zod.validation.middleware'
import { createUser, LoginUser } from '../controller/user/auth/auth.user-controller'
import { GetSingleUserPostSchema } from '../schema/post.schema/get.single.user.post.schema'
import { queryAllUser, getSingleUser } from '../controller/user/get.user/get.user-controller'
import { DeleteSingleUserPostSchema } from '../schema/post.schema/delete.single.user.post.schema'
import { CreatePostBodySchema, CreatePostParamsSchema } from '../schema/post.schema/create.post.schema';
import { createProduct, } from '../controller/products/product-controller'
import { CreateProductParamsSchema, CreateProductBodySchema } from '../schema/product/create.product.schema'
import { createPosts, GetSingleUserPosts, updateSingleUserPost, deleteSingleUserPost } from '../controller/post/post-controller';
import { UpdateSingleUserPostParamSchema, UpdateSingleUserPostBodySchema } from '../schema/post.schema/update.single.user.post.schema'

                  

const router = Router();


router.post("/create/account/user", Validation(CreateUserSchema), createUser);

router.post("/login/user", Validation(LoginUserSchema), LoginUser);

router.get("/query/:userId", Validation(GetAllUserSchema), AuthMiddleware, queryAllUser); // not added to client request

router.get("/query/user/:id", Validation(GetUserSchema), getSingleUser); // not added to client request

// POST ROUTES BELOW
router.post("/create/posts/:userId", Validation(CreatePostParamsSchema), 
    Validation(CreatePostBodySchema), AuthMiddleware, RoleBaseAuthorize(["User"]), createPosts);

router.get("/posts/:userId", 
    Validation(GetSingleUserPostSchema), AuthMiddleware, RoleBaseAuthorize(["User"]), GetSingleUserPosts);

router.patch("/posts/update/:userId/:postId", Validation(UpdateSingleUserPostParamSchema), 
    Validation(UpdateSingleUserPostBodySchema), AuthMiddleware, RoleBaseAuthorize(["User"]), updateSingleUserPost)

router.delete("/posts/delete/:userId/:postId", 
    Validation(DeleteSingleUserPostSchema), AuthMiddleware, RoleBaseAuthorize(["User"]), deleteSingleUserPost);

//PRODUCT ROUTES BELOW
router.post("/create/product/:userId", Validation(CreateProductParamsSchema), 
    Validation(CreateProductBodySchema), AuthMiddleware, RoleBaseAuthorize(["User"]), createProduct);



export default router;