import { z } from 'zod'

import { BaseController, CelosiaResponse, IControllerRequest } from '@celosiajs/core'
import { ZodUploadedFileType } from '@celosiajs/file-upload'

import { ArticleStatus } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import Mime from 'mime'

import Logger from 'Utils/Logger/Logger'

import { JWTVerifiedData } from 'Middlewares/VerifyJWT'

import MinioClient, { MinioBucket } from 'Database/Minio'
import prisma from 'Database/index'

class CreateArticle extends BaseController {
	public async index(
		input: JWTVerifiedData,
		request: IControllerRequest<CreateArticle>,
		response: CelosiaResponse,
	) {
		if (!['image/jpeg', 'image/png'].includes(request.body.thumbnailImage.mimeType)) {
			return response.status(422).json({
				errors: {
					others: ["Invalid 'thumbnailImage' file mime type."],
				},
				data: {},
			})
		}

		const thumbnailImageFileName = `${crypto.randomUUID()}.${Mime.extension(request.body.thumbnailImage.mimeType)}`

		try {
			await MinioClient.putObject(
				MinioBucket.ArticlesImages,
				thumbnailImageFileName,
				request.body.thumbnailImage.buffer,
			)
		} catch (error) {
			Logger.error('CreateArticle controller failed to upload thumbnail', error)

			return response.sendInternalServerError()
		}

		const tagsID = Array.isArray(request.body.tags)
			? request.body.tags.map(tagID => ({ id: tagID }))
			: [{ id: request.body.tags }]

		try {
			const article = await prisma.articles.create({
				data: {
					authorID: input.user.id,
					title: request.body.title,
					content: request.body.content,
					status: request.body.status,
					categoryID: request.body.categoryID,
					tags: {
						connect: tagsID,
					},
					thumbnailImage: { create: { fileName: thumbnailImageFileName } },
				},
				select: {
					id: true,
				},
			})

			return response.status(201).json({
				errors: {},
				data: {
					id: article.id,
				},
			})
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === 'P2003' && error.meta?.field_name === 'categoryID') {
					return response.status(403).json({
						errors: {
							others: ['Category not found.'],
						},
						data: {},
					})
				}

				if (error.code === 'P2025') {
					return response.status(403).json({
						errors: {
							others: [`One of the tags id not found.`],
						},
						data: {},
					})
				}
			}

			Logger.error('CreateArticle controller failed to create category', error)

			return response.sendInternalServerError()
		}
	}

	public override get body() {
		return z.object({
			title: z.string().trim().max(256).min(1),
			content: z.string().trim(),
			status: z.nativeEnum(ArticleStatus),
			categoryID: z.coerce.number(),
			tags: z.union([z.coerce.number().array(), z.coerce.number()]),
			thumbnailImage: ZodUploadedFileType,
		})
	}
}

export default CreateArticle
