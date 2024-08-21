import { z } from 'zod'

import { BaseController, CelosiaResponse, IControllerRequest } from '@celosiajs/core'

import Logger from 'Utils/Logger/Logger'

import { JWTVerifiedData } from 'Middlewares/VerifyJWT'

import prisma from 'Database/index'

class UpdateCategory extends BaseController {
	public async index(
		_: JWTVerifiedData,
		request: IControllerRequest<UpdateCategory>,
		response: CelosiaResponse,
	) {
		try {
			const isCategoryExist = !!(await prisma.categories.findFirst({
				where: {
					id: request.params.id,
				},
				select: { id: true },
			}))

			if (!isCategoryExist) {
				return response.status(404).json({
					errors: {
						others: [`Category not found.`],
					},
					data: {},
				})
			}
		} catch (error) {
			Logger.error('UpdateCategory controller failed to find category with id', error)

			return response.extensions.sendInternalServerError()
		}

		try {
			await prisma.categories.update({
				where: {
					id: request.params.id,
				},
				data: {
					name: request.body.name,
					description: request.body.description,
					parentID: request.body.parentID,
				},
				select: { id: true },
			})

			return response.status(204).send()
		} catch (error) {
			Logger.error('CreateCategory controller failed to update category', error)

			return response.extensions.sendInternalServerError()
		}
	}

	public override get params() {
		return z.object({
			id: z.coerce.number(),
		})
	}

	public override get body() {
		return z.object({
			name: z.string().trim().max(100).min(1),
			description: z.string().trim().max(65535),
			parentID: z.number().int().nullable(),
		})
	}
}

export default UpdateCategory
