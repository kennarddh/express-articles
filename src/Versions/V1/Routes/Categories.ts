import { CelosiaRouter } from '@celosiajs/core'

import { Role } from '@prisma/client'

import RateLimiter from 'Middlewares/RateLimiter'
import RequiredRole from 'Middlewares/RequiredRole'
import VerifyJWT from 'Middlewares/VerifyJWT'

import {
	CreateCategory,
	DeleteCategory,
	GetCategories,
	GetCategoryByID,
	UpdateCategory,
} from 'Versions/V1/Controllers/Categories'

const CategoriesRouter = new CelosiaRouter({ strict: true })

CategoriesRouter.useMiddlewares(new RateLimiter())

CategoriesRouter.post('/', [new VerifyJWT(), new RequiredRole(Role.Admin)], new CreateCategory())
CategoriesRouter.put('/:id', [new VerifyJWT(), new RequiredRole(Role.Admin)], new UpdateCategory())
CategoriesRouter.delete(
	'/:id',
	[new VerifyJWT(), new RequiredRole(Role.Admin)],
	new DeleteCategory(),
)
CategoriesRouter.get('/:id', [], new GetCategoryByID())
CategoriesRouter.get('/', [], new GetCategories())

export default CategoriesRouter
