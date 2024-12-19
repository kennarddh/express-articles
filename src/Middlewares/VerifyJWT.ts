import {
	BaseMiddleware,
	CelosiaRequest,
	CelosiaResponse,
	EmptyObject,
	INextFunction,
} from '@celosiajs/core'

import AccessTokenService from 'Services/Token/AccessTokenService'
import TokenExpiredError from 'Services/Token/Errors/TokenExpiredError'
import TokenVerifyError from 'Services/Token/Errors/TokenVerifyError'

export interface JWTVerifiedData {
	user?: {
		id: number
	}
}

class VerifyJWT extends BaseMiddleware<
	CelosiaRequest,
	CelosiaResponse,
	EmptyObject,
	JWTVerifiedData
> {
	constructor(
		public optional = false,
		private accessTokenService = new AccessTokenService(),
	) {
		super()
	}

	public override async index(
		_: EmptyObject,
		request: CelosiaRequest,
		response: CelosiaResponse,
		next: INextFunction<JWTVerifiedData>,
	) {
		const accessTokenHeader = request.header('Access-Token')

		if (!accessTokenHeader) {
			if (this.optional) return next()

			return response.status(401).json({
				errors: {
					others: ['No access token provided'],
				},
				data: {},
			})
		}

		if (Array.isArray(accessTokenHeader))
			return response.status(401).json({
				errors: {
					others: ['Access token must not be an array'],
				},
				data: {},
			})

		const accessToken = accessTokenHeader.split(' ')[1]

		if (!accessToken)
			return response.status(401).json({
				errors: {
					others: ['Invalid access token'],
				},
				data: {},
			})

		try {
			const payload = await this.accessTokenService.verify(accessToken)

			next({
				user: {
					id: payload.id,
				},
			})
		} catch (error) {
			if (error instanceof TokenExpiredError) {
				return response.status(401).json({
					errors: { others: ['Access token expired'] },
					data: {},
				})
			} else if (error instanceof TokenVerifyError) {
				return response.status(401).json({
					errors: { others: ['Invalid access token'] },
					data: {},
				})
			}

			return response.sendInternalServerError()
		}
	}
}

export default VerifyJWT
