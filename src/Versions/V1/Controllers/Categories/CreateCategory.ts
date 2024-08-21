import { z } from 'zod'

import { BaseController, CelosiaResponse, IControllerRequest } from '@celosiajs/core'

import Logger from 'Utils/Logger/Logger'

import { JWTVerifiedData } from 'Middlewares/VerifyJWT'

import prisma from 'Database/index'

class CreateCategory extends BaseController {
	public async index(
		_: JWTVerifiedData,
		request: IControllerRequest<CreateCategory>,
		response: CelosiaResponse,
	) {
		try {
			const categoriesWithThisNameCount = await prisma.categories.count({
				where: {
					name: request.body.name,
				},
				select: { _all: true },
			})

			if (categoriesWithThisNameCount._all > 0) {
				return response.status(403).json({
					errors: {
						others: [
							`Cannot create category because there is another category with the same name.`,
						],
					},
					data: {},
				})
			}
		} catch (error) {
			Logger.error(
				'CreateCategory controller failed to count categories for unique name check',
				error,
			)

			return response.extensions.sendInternalServerError()
		}

		if (request.body.parentID !== null) {
			try {
				const categoriesWithThisIDCount = await prisma.categories.count({
					where: {
						id: request.body.parentID,
					},
					select: { _all: true },
				})

				if (categoriesWithThisIDCount._all <= 0) {
					return response.status(403).json({
						errors: {
							others: [`Parent category doesn't exist.`],
						},
						data: {},
					})
				}
			} catch (error) {
				Logger.error(
					'CreateCategory controller failed to count categories for valid parent category check',
					error,
				)

				return response.extensions.sendInternalServerError()
			}
		}

		try {
			const category = await prisma.categories.create({
				data: {
					name: request.body.name,
					description: request.body.description,
					parentID: request.body.parentID,
				},
				select: {
					id: true,
				},
			})

			return response.status(201).json({
				errors: {},
				data: {
					id: category.id,
				},
			})
		} catch (error) {
			Logger.error('CreateCategory controller failed to create category', error)

			return response.extensions.sendInternalServerError()
		}
	}

	public override get body() {
		return z.object({
			name: z.string().trim().max(100).min(1),
			description: z.string().trim().max(65535),
			parentID: z.number().int().nullable(),
		})
	}
}

export default CreateCategory
