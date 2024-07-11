import { z } from 'zod'

import { BaseController, ExpressResponse, IControllerRequest } from 'Internals'

import Logger from 'Utils/Logger/Logger'

import { JWTVerifiedData } from 'Middlewares/VerifyJWT'

import prisma from 'Database/index'

class DeleteCategory extends BaseController {
	public async index(
		_: JWTVerifiedData,
		request: IControllerRequest<DeleteCategory>,
		response: ExpressResponse,
	) {
		try {
			const articlesWithThisCategoryCount = await prisma.articles.count({
				where: {
					categoryID: request.params.id,
				},
				select: { _all: true },
			})

			if (articlesWithThisCategoryCount._all > 0) {
				return response.status(403).json({
					errors: {
						others: [
							`Cannot delete category because there are still ${articlesWithThisCategoryCount._all} articles depends on this category.`,
						],
					},
					data: {},
				})
			}
		} catch (error) {
			Logger.error('DeleteCategory controller failed to count articles with category', error)

			return response.status(500).json({
				errors: { others: ['Internal server error'] },
				data: {},
			})
		}

		try {
			await prisma.categories.delete({
				where: {
					id: request.params.id,
				},
				select: {},
			})

			return response.status(204).send()
		} catch (error) {
			Logger.error('DeleteCategory controller failed to delete category', error)

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
}

export default DeleteCategory
