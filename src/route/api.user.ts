// router user
import { Hono } from "hono";
import userController from "../controller/user-controller";

const router = new Hono()

router.route('/', userController)

export default router