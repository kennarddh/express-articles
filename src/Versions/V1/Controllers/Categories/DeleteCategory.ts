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
			const isArticleWithThisCategoryExist = await prisma.articles.findFirst({
				where: {
					categoryID: request.params.id,
				},
				select: { id: true },
			})

			if (isArticleWithThisCategoryExist) {
				return response.status(403).json({
					errors: {
						others: [
							`Cannot delete category because there are still articles depends on this category.`,
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
			const isCategoryWithThisCategoryAsParentExist = !!(await prisma.categories.findFirst({
				where: {
					parentID: request.params.id,
				},
				select: { id: true },
			}))

			if (isCategoryWithThisCategoryAsParentExist) {
				return response.status(422).json({
					errors: {
						others: [
							`Cannot delete category because there are still categories depends on this as parent.`,
						],
					},
					data: {},
				})
			}
		} catch (error) {
			Logger.error(
				'DeleteCategory controller failed to count categories with this as parent',
				error,
			)

			return response.status(500).json({
				errors: { others: ['Internal server error'] },
				data: {},
			})
		}

		try {
			await prisma.categories.deleteMany({
				where: {
					id: request.params.id,
				},
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
