import { z } from 'zod'

import { BaseController, CelosiaResponse, IControllerRequest } from '@celosiajs/core'
import { ZodUploadedFileType } from '@celosiajs/file-upload'

import { ArticleStatus, Prisma } from '@prisma/client'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import Mime from 'mime'

import Logger from 'Utils/Logger/Logger'

import { JWTVerifiedData } from 'Middlewares/VerifyJWT'

import MinioClient, { MinioBucket } from 'Database/Minio'
import prisma from 'Database/index'

class PatchArticle extends BaseController {
	public async index(
		_: JWTVerifiedData,
		request: IControllerRequest<PatchArticle>,
		response: CelosiaResponse,
	) {
		const tagsID =
			request.body.tags === undefined
				? undefined
				: Array.isArray(request.body.tags)
					? request.body.tags.map(tagID => ({ id: tagID }))
					: [{ id: request.body.tags }]

		try {
			const article = await prisma.articles.findFirst({
				where: { id: request.params.id },
				select: { id: true, version: true, thumbnailImage: true },
			})

			if (article === null) {
				return response.status(404).json({
					errors: {
						others: ['Article not found.'],
					},
					data: {},
				})
			}

			let thumbnailImageFileName: string | undefined = undefined

			if (request.body.thumbnailImage) {
				thumbnailImageFileName = `${crypto.randomUUID()}.${Mime.extension(request.body.thumbnailImage.mimeType)}`

				try {
					await MinioClient.putObject(
						MinioBucket.ArticlesImages,
						thumbnailImageFileName,
						request.body.thumbnailImage.buffer,
					)
				} catch (error) {
					Logger.error('PatchArticle controller failed to upload thumbnail', error)

					return response.sendInternalServerError()
				}
			}

			const data: Prisma.ArticlesUpdateArgs['data'] = {}

			if (request.body.title) data.title = request.body.title
			if (request.body.content) data.content = request.body.content
			if (request.body.categoryID) data.categoryID = request.body.categoryID
			if (tagsID)
				data.tags = {
					connect: tagsID,
				}
			if (thumbnailImageFileName)
				data.thumbnailImage = {
					update: {
						fileName: thumbnailImageFileName,
					},
				}

			try {
				await prisma.articles.update({
					where: {
						id: request.params.id,
						version: article.version,
					},
					data: {
						...data,
						version: { increment: 1 },
					},
				})

				if (article.thumbnailImage) {
					try {
						await MinioClient.removeObject(
							MinioBucket.ArticlesImages,
							article.thumbnailImage.fileName,
						)
					} catch (error) {
						Logger.error(
							'PatchArticle controller failed to delete old thumbnail',
							error,
						)
					}
				}

				return response.status(204).send()
			} catch (error) {
				if (thumbnailImageFileName) {
					MinioClient.removeObject(
						MinioBucket.ArticlesImages,
						thumbnailImageFileName,
					).catch((error: unknown) => {
						Logger.error(
							'PatchArticle controller failed to delete new thumbnail',
							error,
						)
					})
				}

				if (error instanceof PrismaClientKnownRequestError) {
					if (tagsID && error.code === 'P2025') {
						return response.status(403).json({
							errors: {
								others: [`One of the tags id not found.`],
							},
							data: {},
						})
					}

					if (error.code === 'P2016') {
						return response.status(409).json({
							errors: {
								others: ['Article have been modified.'],
							},
							data: {},
						})
					}

					if (
						request.body.categoryID &&
						error.code === 'P2003' &&
						error.meta?.field_name === 'categoryID'
					) {
						return response.status(403).json({
							errors: {
								others: ['Category not found.'],
							},
							data: {},
						})
					}
				}

				Logger.error('PatchArticle controller failed to update article', error)

				return response.sendInternalServerError()
			}
		} catch (error) {
			Logger.error('PatchArticle controller failed to find article', error)

			return response.sendInternalServerError()
		}
	}

	public override get params() {
		return z.object({
			id: z.coerce.number(),
		})
	}

	public override get body() {
		return z.object({
			title: z.string().trim().max(256).min(1).optional(),
			content: z.string().trim().optional(),
			status: z.nativeEnum(ArticleStatus).optional(),
			categoryID: z.coerce.number().optional(),
			tags: z.union([z.coerce.number().array(), z.coerce.number()]).optional(),
			thumbnailImage: ZodUploadedFileType.optional(),
		})
	}
}

export default PatchArticle
