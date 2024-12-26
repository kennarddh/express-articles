import { PrismaClient } from '@prisma/client'
import { PrismaClientInitializationError } from '@prisma/client/runtime/library'

import Logger from 'Utils/Logger/Logger'

import Repository from './Repository'

class DatabaseRepository extends Repository {
	private static prisma = new PrismaClient()

	static async connect() {
		Logger.info('Database Init')

		try {
			await this.prisma.$connect()

			Logger.info('Database Connected')
		} catch (error) {
			if (error instanceof PrismaClientInitializationError) {
				Logger.error('Prisma failed to connect to the database.', error)

				Logger.info(`Stopping server`)

				process.exit(1)
			}
		}
	}

	static async disconnect() {
		await this.prisma.$disconnect()
	}

	get prisma() {
		return DatabaseRepository.prisma
	}
}

export default DatabaseRepository
