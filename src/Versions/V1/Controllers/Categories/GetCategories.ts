import { z } from 'zod'

import { BaseController, EmptyObject, ExpressResponse, IControllerRequest } from 'Internals'

import Logger from 'Utils/Logger/Logger'

import prisma from 'Database/index'

class GetCategories extends BaseController {
	public async index(
		_: EmptyObject,
		request: IControllerRequest<GetCategories>,
		response: ExpressResponse,
	) {
		try {
			const categories = await prisma.categories.findMany({
				where: {
					parentID: request.query.parent,
				},
				select: {
					name: true,
					description: true,
				},
			})

			return response.status(200).send({
				errors: {},
				data: {
					list: categories,
				},
			})
		} catch (error) {
			Logger.error('GetCategories controller failed to find categories', error)

			return response.status(500).json({
				errors: { others: ['Internal server error'] },
				data: {},
			})
		}
	}

	public override get query() {
		return z.object({
			parent: z.number().nullable(),
		})
	}
}

export default GetCategories
