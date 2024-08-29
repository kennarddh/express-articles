import { z } from 'zod'

import { BaseController, CelosiaResponse, EmptyObject, IControllerRequest } from '@celosiajs/core'

import Logger from 'Utils/Logger/Logger'

import prisma from 'Database/index'

class GetTagByName extends BaseController {
	public async index(
		_: EmptyObject,
		request: IControllerRequest<GetTagByName>,
		response: CelosiaResponse,
	) {
		try {
			const tag = await prisma.tags.findFirst({
				where: {
					name: request.params.name,
				},
				select: {
					id: true,
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
					id: tag.id,
					description: tag.description,
				},
			})
		} catch (error) {
			Logger.error('GetTagByName controller failed to find tag', error)

			return response.extensions.sendInternalServerError()
		}
	}

	public override get params() {
		return z.object({
			name: z.string(),
		})
	}
}

export default GetTagByName
