import { z } from 'zod'

import { BaseController, CelosiaResponse, IControllerRequest } from '@celosiajs/core'

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

import Logger from 'Utils/Logger/Logger'

import { JWTVerifiedData } from 'Middlewares/VerifyJWT'

import prisma from 'Database/index'

class DeleteArticle extends BaseController {
	public async index(
		_: JWTVerifiedData,
		request: IControllerRequest<DeleteArticle>,
		response: CelosiaResponse,
	) {
		try {
			await prisma.articles.delete({
				where: {
					id: request.params.id,
				},
			})

			return response.status(204).send()
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === 'P2025') {
					return response.status(404).json({
						errors: {
							others: ['Article not found'],
						},
						data: {},
					})
				}
			}

			Logger.error('Article controller failed to delete category', error)

			return response.sendInternalServerError()
		}
	}

	public override get params() {
		return z.object({
			id: z.coerce.number(),
		})
	}
}

export default DeleteArticle
