import { z } from 'zod'

import { BaseController, CelosiaResponse, EmptyObject, IControllerRequest } from '@celosiajs/core'

import Logger from 'Utils/Logger/Logger'

import prisma from 'Database/index'

class GetArticles extends BaseController {
	public async index(
		_: EmptyObject,
		request: IControllerRequest<GetArticles>,
		response: CelosiaResponse,
	) {
		try {
			const articles = await prisma.articles.findMany({
				select: {
					id: true,
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
				orderBy: {
					[request.query.sortBy]: request.query.sort,
				},
				where: {
					...(request.query.search
						? {
								title: { search: request.query.search },
								content: { search: request.query.search },
							}
						: {}),
					...(request.query.author ? { authorID: request.query.author } : {}),
					...(request.query.tags
						? { tags: { every: { id: { in: request.query.tags } } } }
						: {}),
					...(request.query.category ? { categoryID: request.query.category } : {}),
				},
				skip: request.query.offset,
				take: request.query.limit,
			})

			return response.status(200).send({
				errors: {},
				data: {
					list: articles.map(article => ({
						id: article.id,
						title: article.title,
						content: article.content,
						status: article.status,
						author: {
							id: article.author.id,
							name: article.author.name,
						},
						tags: article.tags,
						category: article.category,
						thumbnailImage: article.thumbnailImageFileName
							? `${request.protocol}://${request.header('host') ?? 'unknown'}/articles/image/${article.thumbnailImageFileName}`
							: null,
						createdAt: article.createdAt.getTime(),
						updatedAt: article.updatedAt.getTime(),
					})),
				},
			})
		} catch (error) {
			Logger.error('GetArticles controller failed to find categories', error)

			return response.sendInternalServerError()
		}
	}

	public override get query() {
		return z.object({
			search: z.string().optional(),
			author: z.number().optional(),
			tags: z.number().array().optional(),
			category: z.number().optional(),
			offset: z.number().default(0),
			limit: z.number().default(20),
			sort: z.enum(['asc', 'desc']).default('asc'),
			sortBy: z.enum(['createdAt', 'updatedAt', 'status', 'title']).default('createdAt'),
		})
	}
}

export default GetArticles
