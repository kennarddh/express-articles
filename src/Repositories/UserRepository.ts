import { $Enums } from '@prisma/client'

import Logger from 'Utils/Logger/Logger'

import DatabaseRepository from './DatabaseRepository'
import RepositoryError from './Errors/RepositoryError'
import UnknownEnumKeyError from './Errors/UnknownEnumKeyError'

export interface IUser {
	id: number
	role: UserRole
	name: string
	username: string
	password: string
	createdAt: Date
}

export enum UserRole {
	User = 'User',
	Admin = 'Admin',
}

class UserRepository extends DatabaseRepository {
	private mapPrismaRoleEnumToUserRole(prismaEnum: $Enums.Role) {
		if (prismaEnum === $Enums.Role.Admin) return UserRole.Admin
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (prismaEnum === $Enums.Role.User) return UserRole.User

		throw new UnknownEnumKeyError('role', prismaEnum)
	}

	async getByID(id: number): Promise<IUser | null> {
		try {
			const user = await this.prisma.user.findFirst({
				where: { id },
				select: {
					id: true,
					role: true,
					name: true,
					username: true,
					password: true,
					createdAt: true,
				},
			})

			if (user === null) return null

			const role = this.mapPrismaRoleEnumToUserRole(user.role)

			return {
				id: user.id,
				role,
				name: user.name,
				username: user.username,
				password: user.password,
				createdAt: user.createdAt,
			}
		} catch (error) {
			Logger.error('UserRepository.getByID', error)

			throw new RepositoryError()
		}
	}

	async getByUsername(username: string): Promise<IUser | null> {
		try {
			const user = await this.prisma.user.findFirst({
				where: { username },
				select: {
					id: true,
					role: true,
					name: true,
					username: true,
					password: true,
					createdAt: true,
				},
			})

			if (user === null) return null

			const role = this.mapPrismaRoleEnumToUserRole(user.role)

			return {
				id: user.id,
				role,
				name: user.name,
				username: user.username,
				password: user.password,
				createdAt: user.createdAt,
			}
		} catch (error) {
			Logger.error('UserRepository.getByUsername', error)

			throw new RepositoryError()
		}
	}

	async create(username: string, name: string, password: string): Promise<IUser> {
		try {
			const user = await this.prisma.user.create({
				data: {
					username,
					name,
					password,
				},
			})

			const role = this.mapPrismaRoleEnumToUserRole(user.role)

			return {
				id: user.id,
				role,
				name: user.name,
				username: user.username,
				password: user.password,
				createdAt: user.createdAt,
			}
		} catch (error) {
			Logger.error('UserRepository.create', error)

			throw new RepositoryError()
		}
	}
}

export default UserRepository
