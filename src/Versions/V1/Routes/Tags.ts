import { CelosiaRouter } from '@celosiajs/core'

import { Role } from '@prisma/client'

import RateLimiter from 'Middlewares/RateLimiter'
import RequiredRole from 'Middlewares/RequiredRole'
import VerifyJWT from 'Middlewares/VerifyJWT'

import {
	CreateTags,
	DeleteTag,
	GetTagByID,
	GetTagByName,
	GetTags,
	UpdateTag,
} from 'Versions/V1/Controllers/Tags'

const TagsRouter = new CelosiaRouter({ strict: true })

TagsRouter.useMiddlewares(new RateLimiter())

TagsRouter.post('/', [new VerifyJWT(), new RequiredRole(Role.Admin)], new CreateTags())
TagsRouter.put('/:id', [new VerifyJWT(), new RequiredRole(Role.Admin)], new UpdateTag())
TagsRouter.delete('/:id', [new VerifyJWT(), new RequiredRole(Role.Admin)], new DeleteTag())
TagsRouter.get('/:id', [], new GetTagByID())
TagsRouter.get('/name/:name', [], new GetTagByName())
TagsRouter.get('/', [], new GetTags())

export default TagsRouter
