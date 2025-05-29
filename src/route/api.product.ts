// router product

import { Hono } from 'hono'
import productController from '../controller/product-controller'

const router = new Hono()

router.route('/', productController)

export default router
