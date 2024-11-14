import { z } from 'zod'

import { BaseController, CelosiaResponse, IControllerRequest } from '@celosiajs/core'

import { $Enums } from '@prisma/client'

import Logger from 'Utils/Logger/Logger'

import { JWTVerifiedPopulatedData } from 'Middlewares/PopulateJWTUser'

import prisma from 'Database/index'

class GetArticleByID extends BaseController {
	public async index(
		data: JWTVerifiedPopulatedData,
		request: IControllerRequest<GetArticleByID>,
		response: CelosiaResponse,
	) {
		try {
			const article = await prisma.articles.findFirst({
				where: {
					id: request.params.id,
					...(data.user?.data.role !== $Enums.Role.Admin
						? {
								status: $Enums.ArticleStatus.Public,
							}
						: {}),
				},
				select: {
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
			})

			if (article === null) {
				return response.status(404).json({
					errors: { others: ['Article not found'] },
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
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					...(article.status
						? {
								status: article.status,
							}
						: {}),
					title: article.title,
					content: article.content,
					thumbnailImage: article.thumbnailImage
						? `${request.protocol}://${request.header('host') ?? 'unknown'}/v1/articles/image/${article.thumbnailImage.id}`
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
