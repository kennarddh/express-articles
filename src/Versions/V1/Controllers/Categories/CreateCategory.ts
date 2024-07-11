import { z } from 'zod'

import { BaseController, ExpressResponse, IControllerRequest } from 'Internals'

import Logger from 'Utils/Logger/Logger'

import { JWTVerifiedData } from 'Middlewares/VerifyJWT'

import prisma from 'Database/index'

class CreateCategory extends BaseController {
	public async index(
		_: JWTVerifiedData,
		request: IControllerRequest<CreateCategory>,
		response: ExpressResponse,
	) {
		try {
			const category = await prisma.categories.create({
				data: {
					name: request.body.name,
					description: request.body.description,
					parentID: request.body.parentID,
				},
				select: {
					id: true,
				},
			})

			return response.status(201).json({
				errors: {},
				data: {
					id: category.id,
				},
			})
		} catch (error) {
			Logger.error('CreateCategory controller failed to create category', error)

			return response.status(500).json({
				errors: { others: ['Internal server error'] },
				data: {},
			})
		}
	}

	public override get body() {
		return z.object({
			name: z.string().trim().max(100).min(1),
			description: z.string().trim().max(65535),
			parentID: z.number().int(),
		})
	}
}

export default CreateCategory
