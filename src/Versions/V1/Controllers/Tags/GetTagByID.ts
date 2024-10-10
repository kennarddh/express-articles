import { z } from 'zod'

import { BaseController, CelosiaResponse, EmptyObject, IControllerRequest } from '@celosiajs/core'

import Logger from 'Utils/Logger/Logger'

import prisma from 'Database/index'

class GetTagByID extends BaseController {
	public async index(
		_: EmptyObject,
		request: IControllerRequest<GetTagByID>,
		response: CelosiaResponse,
	) {
		try {
			const tag = await prisma.tags.findFirst({
				where: {
					id: request.params.id,
				},
				select: {
					name: true,
					description: true,
				},
			})

			if (tag === null) {
				return response.status(404).json({
					errors: { others: ['Tag not found'] },
					data: {},
				})
			}

			return response.status(200).send({
				errors: {},
				data: {
					name: tag.name,
					description: tag.description,
				},
			})
		} catch (error) {
			Logger.error('GetTagByID controller failed to find tag', error)

			return response.sendInternalServerError()
		}
	}

	public override get params() {
		return z.object({
			id: z.coerce.number(),
		})
	}
}

export default GetTagByID
