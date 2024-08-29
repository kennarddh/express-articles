import { z } from 'zod'

import { BaseController, CelosiaResponse, IControllerRequest } from '@celosiajs/core'

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

import Logger from 'Utils/Logger/Logger'

import { JWTVerifiedData } from 'Middlewares/VerifyJWT'

import prisma from 'Database/index'

class DeleteTag extends BaseController {
	public async index(
		_: JWTVerifiedData,
		request: IControllerRequest<DeleteTag>,
		response: CelosiaResponse,
	) {
		// TODO: Check if there are still articles that is linked when deleted

		try {
			await prisma.tags.delete({
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
							others: ['Tag not found'],
						},
						data: {},
					})
				}
			}

			Logger.error('DeleteTag controller failed to delete tag', error)

			return response.extensions.sendInternalServerError()
		}
	}

	public override get params() {
		return z.object({
			id: z.coerce.number(),
		})
	}
}

export default DeleteTag
