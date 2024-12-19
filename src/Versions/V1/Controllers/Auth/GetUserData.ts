import { BaseController, CelosiaResponse, IControllerRequest } from '@celosiajs/core'

import UserService from 'Services/UserService/UserService'

import Logger from 'Utils/Logger/Logger'

import { JWTVerifiedData } from 'Middlewares/VerifyJWT'

class GetUserData extends BaseController {
	constructor(private userService = new UserService()) {
		super()
	}

	public async index(
		data: JWTVerifiedData,
		_: IControllerRequest<GetUserData>,
		response: CelosiaResponse,
	) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const id = data.user!.id

		try {
			const userData = await this.userService.getUserData(id)

			if (!userData) {
				Logger.error("Can't find user in GetUserData controller", { id })

				return response.sendInternalServerError()
			}

			return response.status(200).json({
				errors: {},
				data: {
					id: userData.id,
					username: userData.username,
					name: userData.name,
					role: userData.role,
				},
			})
		} catch (error) {
			Logger.error('GetUserData controller failed to get user', error, { id })

			return response.sendInternalServerError()
		}
	}
}

export default GetUserData
