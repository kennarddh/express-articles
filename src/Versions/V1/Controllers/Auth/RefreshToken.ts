import { z } from 'zod'

import { BaseController, CelosiaResponse, EmptyObject, IControllerRequest } from '@celosiajs/core'

import TokenExpiredError from 'Services/Token/Errors/TokenExpiredError'
import TokenVerifyError from 'Services/Token/Errors/TokenVerifyError'
import UserService from 'Services/UserService/UserService'

class RefreshToken extends BaseController {
	constructor(private userService = new UserService()) {
		super()
	}

	public async index(
		_: EmptyObject,
		request: IControllerRequest<RefreshToken>,
		response: CelosiaResponse,
	) {
		const { refreshToken: currentRefreshToken } = request.cookies

		try {
			const { accessToken, refreshToken } =
				await this.userService.refreshToken(currentRefreshToken)

			response.cookie('refreshToken', refreshToken, {
				secure: process.env.NODE_ENV === 'production',
				httpOnly: true,
				sameSite: 'lax',
			})

			return response.status(200).json({
				errors: {},
				data: {
					token: `Bearer ${accessToken}`,
				},
			})
		} catch (error) {
			if (error instanceof TokenExpiredError) {
				return response.status(401).json({
					errors: { others: ['Refresh token expired'] },
					data: {},
				})
			} else if (error instanceof TokenVerifyError) {
				return response.status(401).json({
					errors: { others: ['Invalid refresh token'] },
					data: {},
				})
			}

			return response.sendInternalServerError()
		}
	}

	public override get cookies() {
		return z.object({
			refreshToken: z.string(),
		})
	}
}

export default RefreshToken
