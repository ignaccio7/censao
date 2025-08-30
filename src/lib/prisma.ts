import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => new PrismaClient()

declare const global: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof globalThis

const prisma = global.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  global.prismaGlobal = prisma
}

export default prisma
