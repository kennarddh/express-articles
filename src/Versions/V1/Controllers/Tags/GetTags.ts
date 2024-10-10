import { z } from 'zod'

import { BaseController, CelosiaResponse, EmptyObject, IControllerRequest } from '@celosiajs/core'

import Logger from 'Utils/Logger/Logger'

import prisma from 'Database/index'

class GetTags extends BaseController {
	public async index(
		_: EmptyObject,
		request: IControllerRequest<GetTags>,
		response: CelosiaResponse,
	) {
		try {
			const tags =
				request.query.search === undefined
					? await prisma.tags.findMany({
							select: {
								name: true,
								description: true,
							},
						})
					: await prisma.tags.findMany({
							where: {
								name: { search: request.query.search },
								description: { search: request.query.search },
							},
							select: {
								name: true,
								description: true,
							},
						})

			return response.status(200).send({
				errors: {},
				data: {
					list: tags,
				},
			})
		} catch (error) {
			Logger.error('GetTags controller failed to find tags', error)

			return response.sendInternalServerError()
		}
	}

	public override get query() {
		return z.object({
			search: z.string().optional(),
		})
	}
}

export default GetTags
