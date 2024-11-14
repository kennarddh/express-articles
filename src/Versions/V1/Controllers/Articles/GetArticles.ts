import { z } from 'zod'

import { BaseController, CelosiaResponse, IControllerRequest } from '@celosiajs/core'

import { $Enums } from '@prisma/client'

import Logger from 'Utils/Logger/Logger'

import { JWTVerifiedPopulatedData } from 'Middlewares/PopulateJWTUser'

import prisma from 'Database/index'

class GetArticles extends BaseController {
	public async index(
		data: JWTVerifiedPopulatedData,
		request: IControllerRequest<GetArticles>,
		response: CelosiaResponse,
	) {
		try {
			const articles = await prisma.articles.findMany({
				select: {
					id: true,
					title: true,
					content: true,
					thumbnailImage: true,
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
					status: data.user?.data.role === $Enums.Role.Admin,
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
					...(data.user?.data.role !== $Enums.Role.Admin
						? {
								status: $Enums.ArticleStatus.Public,
							}
						: {}),
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
						// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
						...(article.status
							? {
									status: article.status,
								}
							: {}),
						author: {
							id: article.author.id,
							name: article.author.name,
						},
						tags: article.tags,
						category: article.category,
						thumbnailImage: article.thumbnailImage
							? `${request.protocol}://${request.header('host') ?? 'unknown'}/v1/articles/image/${article.thumbnailImage.id}`
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
