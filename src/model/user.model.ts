import { prisma } from '../lib/prisma'

export const db = {
  findAll: () => prisma.users.findMany(),
  findById: (id: string) => prisma.users.findUnique({ where: { id } }),
  findByEmail: (email: string) => prisma.users.findUnique({ where: { email } }),
  create: (data: any) => prisma.users.create({ data }),
  update: (id: string, data: any) => prisma.users.update({ where: { id }, data }),
  delete: (id: string) => prisma.users.delete({ where: { id } }),
}
