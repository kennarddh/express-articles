import { BaseController, CelosiaResponse, IControllerRequest } from '@celosiajs/core'

import Logger from 'Utils/Logger/Logger'

import { JWTVerifiedData } from 'Middlewares/VerifyJWT'

import prisma from 'Database/index'

class GetUserData extends BaseController {
	public async index(
		data: JWTVerifiedData,
		_: IControllerRequest<GetUserData>,
		response: CelosiaResponse,
	) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const id = data.user!.id

		try {
			const user = await prisma.user.findFirst({
				where: { id },
				select: {
					id: true,
					username: true,
					name: true,
					role: true,
				},
			})

			if (!user) {
				Logger.error("Can't find user in GetUserData controller", { id })

				return response.sendInternalServerError()
			}

			return response.status(200).json({
				errors: {},
				data: {
					id: user.id,
					username: user.username,
					name: user.name,
					role: user.role,
				},
			})
		} catch (error) {
			Logger.error('GetUserData controller failed to get user', error, { id })

			return response.sendInternalServerError()
		}
	}
}

export default GetUserData
