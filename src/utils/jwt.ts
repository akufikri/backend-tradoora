import { sign, verify } from 'hono/jwt'

const JWT_SECRET = Bun.env.JWT_SECRET || 'TRADOORA4436'

export const signToken = async (payload: any) => {
  return await sign(
    { ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 }, // 1 jam
    JWT_SECRET
  )
}
export const verifyToken = async (token: string) => {
  return await verify(token, JWT_SECRET)
}