import { z } from 'zod'

import { BaseController, CelosiaResponse, IControllerRequest } from '@celosiajs/core'

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

import Logger from 'Utils/Logger/Logger'

import { JWTVerifiedData } from 'Middlewares/VerifyJWT'

import prisma from 'Database/index'

class UpdateCategory extends BaseController {
	public async index(
		_: JWTVerifiedData,
		request: IControllerRequest<UpdateCategory>,
		response: CelosiaResponse,
	) {
		// TODO: Check if new parentID creating a circular hierarchy

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
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === 'P2025') {
					return response.status(404).json({
						errors: {
							others: ['Category not found'],
						},
						data: {},
					})
				} else if (error.code === 'P2023' && error.meta?.field_name === 'parentID') {
					return response.status(403).json({
						errors: {
							others: ["Parent category doesn't exist"],
						},
						data: {},
					})
				}
			}
			Logger.error('UpdateCategory controller failed to update category', error)

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
