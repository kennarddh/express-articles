import { z } from 'zod'

import { BaseController, CelosiaResponse, EmptyObject, IControllerRequest } from '@celosiajs/core'

import Logger from 'Utils/Logger/Logger'

import prisma from 'Database/index'

class GetCategories extends BaseController {
	public async index(
		_: EmptyObject,
		request: IControllerRequest<GetCategories>,
		response: CelosiaResponse,
	) {
		try {
			const categories = await prisma.categories.findMany({
				where: {
					parentID: request.query.parent ?? null,
				},
				select: {
					name: true,
					description: true,
					parentID: true,
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

			return response.sendInternalServerError()
		}
	}

	public override get query() {
		return z.object({
			parent: z.number().nullish(),
		})
	}
}

export default GetCategories
