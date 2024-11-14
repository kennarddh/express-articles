import { CelosiaRouter } from '@celosiajs/core'
import { FileUpload } from '@celosiajs/file-upload'

import { Role } from '@prisma/client'

import RateLimiter from 'Middlewares/RateLimiter'
import RequiredRole from 'Middlewares/RequiredRole'
import VerifyJWT from 'Middlewares/VerifyJWT'

import {
	CreateArticle,
	DeleteArticle,
	GetArticleByID,
	GetArticleImage,
	GetArticles,
	PatchArticle,
	UpdateArticle,
} from 'Versions/V1/Controllers/Articles'

const ArticlesRouter = new CelosiaRouter({ strict: true })

ArticlesRouter.useMiddlewares(new RateLimiter())

ArticlesRouter.post(
	'/',
	[new FileUpload({ limits: { fileSize: 2 * 1024 * 1024 } })], // 2MB
	[new VerifyJWT(), new RequiredRole(Role.Admin)],
	new CreateArticle(),
)
ArticlesRouter.put(
	'/:id',
	[new FileUpload({ limits: { fileSize: 2 * 1024 * 1024 } })], // 2MB
	[new VerifyJWT(), new RequiredRole(Role.Admin)],
	new UpdateArticle(),
)
ArticlesRouter.patch(
	'/:id',
	[new FileUpload({ limits: { fileSize: 2 * 1024 * 1024 } })], // 2MB
	[new VerifyJWT(), new RequiredRole(Role.Admin)],
	new PatchArticle(),
)
ArticlesRouter.delete('/:id', [new VerifyJWT(), new RequiredRole(Role.Admin)], new DeleteArticle())
ArticlesRouter.get('/:id', [], new GetArticleByID())
ArticlesRouter.get('/image/:id', [], new GetArticleImage())
ArticlesRouter.get('/', [], new GetArticles())

export default ArticlesRouter
