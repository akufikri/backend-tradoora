import { db } from '../model/user.model'

export const UserService = {
  list: () => db.findAll(),
  get: (id: string) => db.findById(id),
  getByEmail: (email: string) => db.findByEmail(email),
  create: (data: any) => db.create(data),
  update: (id: string, data: any) => db.update(id, data),
  delete: (id: string) => db.delete(id),
}
