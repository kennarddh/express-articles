import { z } from 'zod'

import { BaseController, CelosiaResponse, IControllerRequest } from '@celosiajs/core'

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

import Logger from 'Utils/Logger/Logger'

import { JWTVerifiedData } from 'Middlewares/VerifyJWT'

import prisma from 'Database/index'

class CreateTags extends BaseController {
	public async index(
		_: JWTVerifiedData,
		request: IControllerRequest<CreateTags>,
		response: CelosiaResponse,
	) {
		const tags = Array.isArray(request.body) ? request.body : [request.body]

		try {
			const createdTags = await prisma.$transaction(
				tags.map(tag =>
					prisma.tags.create({ data: { name: tag.name, description: tag.description } }),
				),
			)

			return response.status(201).json({
				errors: {},
				data: {
					ids: createdTags.map(tag => tag.id),
				},
			})
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					return response.status(422).json({
						errors: {
							others: ['Name taken by another tag'],
						},
						data: {},
					})
				}
			}

			Logger.error('CreateTags controller failed to create tags', error)

			return response.sendInternalServerError()
		}
	}

	public override get body() {
		return z.union([
			z.array(
				z.object({
					name: z.string().trim().max(100).min(1),
					description: z.string().trim().max(65535),
				}),
			),
			z.object({
				name: z.string().trim().max(100).min(1),
				description: z.string().trim().max(65535),
			}),
		])
	}
}

export default CreateTags
