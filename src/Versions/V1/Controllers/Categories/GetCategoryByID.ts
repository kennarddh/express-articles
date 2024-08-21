import { z } from 'zod'

import { BaseController, CelosiaResponse, EmptyObject, IControllerRequest } from '@celosiajs/core'

import Logger from 'Utils/Logger/Logger'

import prisma from 'Database/index'

class GetCategoryByID extends BaseController {
	public async index(
		_: EmptyObject,
		request: IControllerRequest<GetCategoryByID>,
		response: CelosiaResponse,
	) {
		try {
			const category = await prisma.categories.findFirst({
				where: {
					id: request.params.id,
				},
				select: {
					name: true,
					description: true,
					parentID: true,
				},
			})

			if (category === null) {
				return response.status(404).json({
					errors: { others: ['Category not found'] },
					data: {},
				})
			}

			return response.status(200).send({
				errors: {},
				data: {
					name: category.name,
					description: category.description,
					parentID: category.parentID,
				},
			})
		} catch (error) {
			Logger.error('GetCategoryByID controller failed to find category', error)

			return response.extensions.sendInternalServerError()
		}
	}

	public override get params() {
		return z.object({
			id: z.coerce.number(),
		})
	}
}

export default GetCategoryByID
