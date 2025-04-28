import bcrypt from 'bcrypt'
import prisma from '../lib/prisma'
import { CustomError } from '../utils/custom-error'
import { handlePrismaError } from '../utils/prisma-error'
import {
  processFilters,
  parseInclude,
  parseValue,
} from '../utils/query-parser'
import i18n from '../config/i18n'

export class AuthService {

  async findAll(query: any, lang: string) {
    i18n.setLocale(lang)

    try {
      let { page, pageSize, include, orderBy, ...filters } = query

      if (include) include = parseInclude(include)
      if (orderBy) orderBy = parseInclude(orderBy)
      filters = processFilters(filters)

      const options: any = { where: filters, include, orderBy }

      if (page && pageSize) {
        const skip = (+page - 1) * +pageSize
        const take = +pageSize
        const [data, total] = await Promise.all([
          prisma.user.findMany({ ...options, skip, take }),
          prisma.user.count({ where: filters }),
        ])
        return { data, total, page: +page, pageSize: +pageSize }
      }

      return prisma.user.findMany(options)
    } catch (e) {
      handlePrismaError(e, i18n.__('User'))
    }
  }

  async register(
    data: { email: string; password?: string; name?: string },
    lang: string,
  ) {
    i18n.setLocale(lang)
    try {
      const hashed = data.password
        ? await bcrypt.hash(data.password, 10)
        : undefined

      return await prisma.user.create({
        data: { ...data, password: hashed,provider:'local' },
      })
    } catch (e) {
      handlePrismaError(e, i18n.__('User'))
    }
  }

  async login(email: string, password: string, lang: string) {
    i18n.setLocale(lang)
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.password)
      throw new CustomError(i18n.__('Incorrect email or password'), 400)

    const ok = await bcrypt.compare(password, user.password)
    if (!ok)
      throw new CustomError(i18n.__('Incorrect email or password'), 400)

    return user
  }

  async getProfile(id: string) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new CustomError(i18n.__('User not found'), 404)
    return { id: user.id, email: user.email, name: user.name, role: user.role }
  }
}
