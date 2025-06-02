import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import { UserService } from '../../services/user.service'
import { signToken } from '../../utils/jwt'
import * as bcrypt from 'bcrypt-ts'
import type { Context } from '../context'

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
        return {
          success: false,
          message: 'Email already in use',
          data: null,
        }
      }

      const hashedPassword = await bcrypt.hash(input.password, 10)
      const user = await UserService.create({
        name: input.name,
        email: input.email,
        password: hashedPassword,
      })

      return {
        success: true,
        message: 'User created successfully',
        data: {
          id: user.id,
          email: user.email,
        },
      }
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
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          data: null,
        }
      }

      const valid = await bcrypt.compare(input.password, user.password)
      if (!valid) {
        return {
          success: false,
          message: 'Invalid password',
          data: null,
        }
      }

      const token = await signToken({ id: user.id, email: user.email })
      return {
        success: true,
        message: 'Login successful',
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
      }
    }),

  me: t.procedure.query(({ ctx }) => {
    if (!ctx.user) {
      return {
        success: false,
        message: 'Unauthorized',
        data: null,
      }
    }

    return {
      success: true,
      message: 'User profile fetched successfully',
      id: ctx.user.id,
      name: ctx.user.name,
      email: ctx.user.email,
    }
  }),

  logout: t.procedure.mutation(() => {
    return {
      success: true,
      message: 'Logged out successfully',
      data: null,
    }
  }),
})
