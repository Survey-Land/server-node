import { Prisma } from '@prisma/client'
import { CustomError } from './custom-error'
import i18n from '../config/i18n'

export function handlePrismaError(
  error: unknown,
  modelLabel = i18n.__('Record'),
): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new CustomError(
          i18n.__('Unique constraint failed, data already exists'),
          409,
        )

      case 'P2025':
        throw new CustomError(
          i18n.__('%s not found', modelLabel),
          404,
        )

      default:
        throw new CustomError(
          i18n.__('Database error: %s', error.code),
          500,
        )
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new CustomError(
      i18n.__('Data validation error'),
      400,
    )
  }

  throw new CustomError(
    i18n.__('Database connection error'),
    500,
  )
}
