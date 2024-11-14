import { BaseMiddleware, CelosiaRequest, CelosiaResponse, INextFunction } from '@celosiajs/core'

import { $Enums } from '@prisma/client'

import Logger from 'Utils/Logger/Logger'

import prisma from 'Database/index'

import { JWTVerifiedData } from './VerifyJWT'

export interface JWTVerifiedPopulatedData {
	user?: {
		id: number
		data: {
			createdAt: Date
			updatedAt: Date
			name: string
			username: string
			role: $Enums.Role
		}
	}
}

class PopulateJWTUser extends BaseMiddleware<
	CelosiaRequest,
	CelosiaResponse,
	JWTVerifiedData,
	JWTVerifiedPopulatedData
> {
	public override async index(
		data: JWTVerifiedData,
		_: CelosiaRequest,
		response: CelosiaResponse,
		next: INextFunction<JWTVerifiedPopulatedData>,
	) {
		if (!data.user) return next()

		try {
			const user = await prisma.user.findFirst({
				where: { id: data.user.id },
				select: {
					createdAt: true,
					updatedAt: true,
					username: true,
					role: true,
					name: true,
				},
			})

			if (!user) {
				Logger.error('PopulateJWTUser middleware no user with the id found.', {
					id: data.user.id,
				})

				return response.sendInternalServerError()
			}

			next({ user: { id: data.user.id, data: user } })
		} catch (error) {
			Logger.error('PopulateJWTUser middleware failed to get user.', error, {
				id: data.user.id,
			})

			return response.sendInternalServerError()
		}
	}
}

export default PopulateJWTUser
