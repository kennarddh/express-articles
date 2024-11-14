import { BaseMiddleware, CelosiaRequest, CelosiaResponse, INextFunction } from '@celosiajs/core'

import { Role } from '@prisma/client'

import Logger from 'Utils/Logger/Logger'

import prisma from 'Database/index'

import { JWTVerifiedData } from './VerifyJWT'

class RequiredRole extends BaseMiddleware<CelosiaRequest, CelosiaResponse, JWTVerifiedData> {
	constructor(public requiredRole: Role) {
		super()
	}

	public override async index(
		data: JWTVerifiedData,
		_: CelosiaRequest,
		response: CelosiaResponse,
		next: INextFunction,
	) {
		try {
			const user = await prisma.user.findFirst({
				where: {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					id: data.user!.id,
				},
				select: {
					role: true,
				},
			})

			if (user === null) {
				Logger.warn('Cannot find user id in valid signed JWT')

				return response.status(404).json({
					errors: {
						others: ['User not found'],
					},
					data: {},
				})
			}

			if (user.role !== this.requiredRole)
				return response.status(403).json({
					errors: {
						others: [`Only ${this.requiredRole} is allowed`],
					},
					data: {},
				})

			next()
		} catch (error) {
			Logger.error('RequiredRole middleware failed to find user', error)

			return response.sendInternalServerError()
		}
	}
}

export default RequiredRole
