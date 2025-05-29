import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import { UserService } from '../../services/user.service'
import { signToken } from '../../utils/jwt'
import * as bcrypt from 'bcrypt-ts'
import type { Context } from '../context'
import { errorResponse, response } from '../../utils/response'

const t = initTRPC.context<Context>().create()

export const trpcUserRouter = t.router({
  register: t.procedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await UserService.getByEmail(input.email)
      if (existing) {
        return errorResponse('Email already in use')
      }

      const hashedPassword = await bcrypt.hash(input.password, 10)
      const user = await UserService.create({
        name: input.name,
        email: input.email,
        password: hashedPassword,
      })

      return response({ id: user.id, email: user.email }, 'User created successfully')
    }),
  login: t.procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await UserService.getByEmail(input.email)
      if (!user) return errorResponse('User not found')

      const valid = await bcrypt.compare(input.password, user.password)
      if (!valid) return errorResponse('Invalid password')

      const token = await signToken({ id: user.id, email: user.email })
      return response({ token }, 'Login successful')
    }),

  me: t.procedure.query(({ ctx }) => {
    if (!ctx.user) return errorResponse('Unauthorized')

    return response(
      {
        id: ctx.user.id,
        name: ctx.user.name,
        email: ctx.user.email,
      },
      'User profile fetched successfully'
    )
  }),
  logout: t.procedure.mutation(() => {
    return { success: true }
  }),
})
