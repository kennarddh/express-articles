import { z } from 'zod'

import { BaseController, CelosiaResponse, IControllerRequest } from '@celosiajs/core'

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

import Logger from 'Utils/Logger/Logger'

import { JWTVerifiedData } from 'Middlewares/VerifyJWT'

import prisma from 'Database/index'

class DeleteCategory extends BaseController {
	public async index(
		_: JWTVerifiedData,
		request: IControllerRequest<DeleteCategory>,
		response: CelosiaResponse,
	) {
		// TODO: Check if there are still articles that is linked when deleted

		try {
			await prisma.categories.delete({
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
							others: ['Category not found'],
						},
						data: {},
					})
				} else if (error.code === 'P2003' && error.meta?.field_name === 'parentID') {
					return response.status(404).json({
						errors: {
							others: ['Cannot delete a category that has descendants'],
						},
						data: {},
					})
				}
			}

			Logger.error('DeleteCategory controller failed to delete category', error)

			return response.sendInternalServerError()
		}
	}

	public override get params() {
		return z.object({
			id: z.coerce.number(),
		})
	}
}

export default DeleteCategory
