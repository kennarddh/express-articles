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

		const targetCategoryID = request.params.id

		let currentParentID: number | null = request.body.parentID

		while (currentParentID !== null) {
			const currentCategory = await prisma.categories.findFirst({
				where: { id: currentParentID },
				select: { id: true, parentID: true },
			})

			currentParentID = currentCategory?.parentID ?? null

			if (currentCategory?.id === targetCategoryID) {
				return response.status(403).json({
					errors: {
						others: ['Circular parentID is not allowed'],
					},
					data: {},
				})
			}
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
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === 'P2025') {
					return response.status(404).json({
						errors: {
							others: ['Category not found'],
						},
						data: {},
					})
				} else if (error.code === 'P2002') {
					return response.status(404).json({
						errors: {
							others: ['Name taken by another category'],
						},
						data: {},
					})
				} else if (error.code === 'P2003' && error.meta?.field_name === 'parentID') {
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
