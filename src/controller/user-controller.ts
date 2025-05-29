import { Hono } from 'hono'
import { z } from 'zod'
import { UserService } from '../services/user.service'
import { signToken, verifyToken } from '../utils/jwt'
import { hash, compare } from 'bcrypt-ts'

const router = new Hono()

const registerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

router.post('/register', async (c) => {
  const body = await c.req.json()
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: parsed.error.format() }, 400)
  }

  const existingUser = await UserService.list().then((users: any[]) =>
    users.find(u => u.email === parsed.data.email)
  )
  if (existingUser) {
    return c.json({ error: 'Email already registered' }, 400)
  }

  const hashedPassword = await hash(parsed.data.password, 10)
  const newUser = await UserService.create({
    ...parsed.data,
    password: hashedPassword,
  })

  const token = await signToken({ id: newUser.id })
  return c.json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email } })
})

router.post('/login', async (c) => {
  const body = await c.req.json()
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: parsed.error.format() }, 400)
  }

  const user = await UserService.list().then((users: any[]) =>
    users.find(u => u.email === parsed.data.email)
  )
  if (!user) return c.json({ error: 'Invalid credentials' }, 401)

  const passwordValid = await compare(parsed.data.password, user.password)
  if (!passwordValid) return c.json({ error: 'Invalid credentials' }, 401)

  const token = await signToken({ id: user.id })
  return c.json({ token, user: { id: user.id, name: user.name, email: user.email } })
})

router.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization')
  const token = authHeader?.split(' ')[1]
  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  try {
    const payload = await verifyToken(token) as { id: string }
    const user = await UserService.get(payload.id)
    if (!user) return c.json({ error: 'User not found' }, 404)

    return c.json({ user: { id: user.id, name: user.name, email: user.email } })
  } catch (e) {
    return c.json({ error: 'Invalid token' }, 401)
  }
})

router.post('/logout', async (c) => {
  return c.json({ message: 'Logged out successfully' })
})

export default router
