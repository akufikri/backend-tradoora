import { Hono } from 'hono'
import { z } from 'zod'
import { ProductService } from '../services/product.service'

const productSchema = z.object({
  sku: z.string(),
  slug: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  imageUrl: z.string().url().optional(),
  stockQuantity: z.number(),
  minimumOrderQuantity: z.number(),
})

const router = new Hono()

router.get('/', async (c) => {
  const products = await ProductService.list()
  return c.json(products)
})

router.get('/:id', async (c) => {
  const id = c.req.param('id')
  const product = await ProductService.get(id)
  return product ? c.json(product) : c.notFound()
})

router.post('/', async (c) => {
  const body = await c.req.json()
  const parsed = productSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: parsed.error.format() }, 400)
  }
  const product = await ProductService.create(parsed.data)
  return c.json(product, 201)
})

router.put('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const parsed = productSchema.partial().safeParse(body)
  if (!parsed.success) {
    return c.json({ error: parsed.error.format() }, 400)
  }
  const updated = await ProductService.update(id, parsed.data)
  return c.json(updated)
})

router.delete('/:id', async (c) => {
  const id = c.req.param('id')
  await ProductService.delete(id)
  return c.json({ message: 'Product deleted' })
})

export default router
