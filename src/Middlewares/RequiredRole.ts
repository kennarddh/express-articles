import { Role } from '@prisma/client'

import { BaseMiddleware, ExpressRequest, ExpressResponse, StopHere } from 'Internals'

import Logger from 'Utils/Logger/Logger'

import prisma from 'Database/index'

import { JWTVerifiedData } from './VerifyJWT'

class RequiredRole extends BaseMiddleware<ExpressRequest, ExpressResponse, JWTVerifiedData> {
	constructor(public requiredRole: Role) {
		super()
	}

	public override async index(
		data: JWTVerifiedData,
		_: ExpressRequest,
		response: ExpressResponse,
	) {
		try {
			const user = await prisma.user.findFirst({
				where: {
					id: data.user.id,
				},
				select: {
					role: true,
				},
			})

			if (user === null) {
				Logger.warn('Cannot find user id in valid signed JWT')

				response.status(400).json({
					errors: {
						others: ['User not found'],
					},
					data: {},
				})

				return StopHere
			}

			if (user.role !== this.requiredRole) {
				response.status(403).json({
					errors: {
						others: [`Only ${this.requiredRole} is allowed.`],
					},
					data: {},
				})

				return StopHere
			}
		} catch (error) {
			Logger.error('RequiredRole middleware failed to find user', error)

			response.status(500).json({
				errors: { others: ['Internal server error'] },
				data: {},
			})

			return StopHere
		}
	}
}

export default RequiredRole
