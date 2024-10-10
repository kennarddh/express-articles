import { z } from 'zod'

import { BaseController, CelosiaResponse, IControllerRequest } from '@celosiajs/core'

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

import Logger from 'Utils/Logger/Logger'

import { JWTVerifiedData } from 'Middlewares/VerifyJWT'

import prisma from 'Database/index'

class UpdateTag extends BaseController {
	public async index(
		_: JWTVerifiedData,
		request: IControllerRequest<UpdateTag>,
		response: CelosiaResponse,
	) {
		try {
			await prisma.tags.update({
				where: {
					id: request.params.id,
				},
				data: {
					name: request.body.name,
					description: request.body.description,
				},
				select: { id: true },
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
				} else if (error.code === 'P2002') {
					return response.status(404).json({
						errors: {
							others: ['Name taken by another tag'],
						},
						data: {},
					})
				}
			}

			Logger.error('UpdateTag controller failed to update tag', error)

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
			name: z.string().trim().max(100).min(1),
			description: z.string().trim().max(65535),
		})
	}
}

export default UpdateTag
