import { z } from 'zod'

import { BaseController, CelosiaResponse, EmptyObject, IControllerRequest } from '@celosiajs/core'

import Logger from 'Utils/Logger/Logger'

import prisma from 'Database/index'

class GetArticleByID extends BaseController {
	public async index(
		_: EmptyObject,
		request: IControllerRequest<GetArticleByID>,
		response: CelosiaResponse,
	) {
		try {
			const article = await prisma.articles.findFirst({
				where: {
					id: request.params.id,
				},
				select: {
					title: true,
					content: true,
					thumbnailImageFileName: true,
					author: {
						select: {
							id: true,
							name: true,
						},
					},
					createdAt: true,
					updatedAt: true,
					category: {
						select: {
							id: true,
							name: true,
						},
					},
					tags: {
						select: {
							id: true,
							name: true,
						},
					},
					status: true,
				},
			})

			if (article === null) {
				return response.status(404).json({
					errors: { others: ['Article not found.'] },
					data: {},
				})
			}

			return response.status(200).send({
				errors: {},
				data: {
					author: {
						id: article.author.id,
						name: article.author.name,
					},
					tags: article.tags,
					category: article.category,
					createdAt: article.createdAt.getTime(),
					updatedAt: article.updatedAt.getTime(),
					status: article.status,
					title: article.title,
					content: article.content,
					thumbnailImage: article.thumbnailImageFileName
						? `${request.protocol}://${request.header('host') ?? 'unknown'}/articles/image/${article.thumbnailImageFileName}`
						: null,
				},
			})
		} catch (error) {
			Logger.error('GetArticleByID controller failed to find article', error)

			return response.sendInternalServerError()
		}
	}

	public override get params() {
		return z.object({
			id: z.coerce.number(),
		})
	}
}

export default GetArticleByID
