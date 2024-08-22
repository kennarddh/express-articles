import { z } from 'zod'

import { BaseController, CelosiaResponse, IControllerRequest } from '@celosiajs/core'

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

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
			const category = await prisma.categories.create({
				data: {
					name: request.body.name,
					description: request.body.description,
					parentID: request.body.parentID ?? null,
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
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					return response.status(403).json({
						errors: {
							others: ['Name taken by another category'],
						},
						data: {},
					})
				}

				if (error.code === 'P2003') {
					return response.status(403).json({
						errors: {
							others: [`Parent category doesn't exist.`],
						},
						data: {},
					})
				}
			}

			Logger.error('CreateCategory controller failed to create category', error)

			return response.extensions.sendInternalServerError()
		}
	}

	public override get body() {
		return z.object({
			name: z.string().trim().max(100).min(1),
			description: z.string().trim().max(65535),
			parentID: z.number().int().nullish(),
		})
	}
}

export default CreateCategory
