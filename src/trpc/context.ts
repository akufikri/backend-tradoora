import type { inferAsyncReturnType } from '@trpc/server'
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { verifyToken } from '../utils/jwt'
import { UserService } from '../services/user.service'

export async function createContext({ req }: FetchCreateContextFnOptions) {
  const authHeader = req.headers.get('authorization')
  let user = null

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    try {
      const decoded = await verifyToken(token) as { id: string }
      if (decoded?.id) {
        user = await UserService.get(decoded.id)
      }
    } catch (e) {
      console.error('Invalid token', e)
    }
  }

  return { user }
}

export type Context = inferAsyncReturnType<typeof createContext>
