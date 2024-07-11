import { z } from 'zod'

import { BaseController, ExpressResponse, IControllerRequest } from 'Internals'

import Logger from 'Utils/Logger/Logger'

import { JWTVerifiedData } from 'Middlewares/VerifyJWT'

import prisma from 'Database/index'

class UpdateCategory extends BaseController {
	public async index(
		_: JWTVerifiedData,
		request: IControllerRequest<UpdateCategory>,
		response: ExpressResponse,
	) {
		try {
			await prisma.categories.update({
				where: {
					id: request.params.id,
				},
				data: {
					name: request.body.name,
					description: request.body.description,
					parentID: request.body.parentID,
				},
				select: {},
			})

			return response.status(204).send()
		} catch (error) {
			Logger.error('CreateCategory controller failed to update category', error)

			return response.status(500).json({
				errors: { others: ['Internal server error'] },
				data: {},
			})
		}
	}

	public override get params() {
		return z.object({
			id: z.coerce.number(),
		})
	}

	public override get body() {
		return z.object({
			name: z.string().trim().max(100).min(1),
			description: z.string().trim().max(65535),
			parentID: z.number().int(),
		})
	}
}

export default UpdateCategory
