import { z } from 'zod'

import { BaseController, CelosiaResponse, EmptyObject, IControllerRequest } from '@celosiajs/core'

import Mime from 'mime'

import Logger from 'Utils/Logger/Logger'

import MinioClient, { MinioBucket } from 'Database/Minio'
import prisma from 'Database/index'

class GetArticleImage extends BaseController {
	public async index(
		_: EmptyObject,
		request: IControllerRequest<GetArticleImage>,
		response: CelosiaResponse,
	) {
		try {
			const articleImage = await prisma.articlesImages.findFirst({
				where: {
					id: request.params.id,
				},
				select: { fileName: true },
			})

			if (articleImage === null) {
				return response.status(404).json({
					errors: { others: ['Article image not found'] },
					data: {},
				})
			}

			try {
				const imageObjectStream = await MinioClient.getObject(
					MinioBucket.ArticlesImages,
					articleImage.fileName,
				)

				response.header('Content-Type', Mime.lookup(articleImage.fileName))

				imageObjectStream.pipe(response.expressResponse)
			} catch (error) {
				Logger.error('GetArticleImage controller failed to get image object', error)

				return response.sendInternalServerError()
			}
		} catch (error) {
			Logger.error('GetArticleImage controller failed to find article image', error)

			return response.sendInternalServerError()
		}
	}

	public override get params() {
		return z.object({
			id: z.coerce.number(),
		})
	}
}

export default GetArticleImage
