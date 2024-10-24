import { CelosiaRouter } from '@celosiajs/core'

import AuthRouter from 'Versions/V1/Routes/Auth'

import ArticlesRouter from './Articles'
import CategoriesRouter from './Categories'
import TagsRouter from './Tags'

const V1Router = new CelosiaRouter({ strict: true })

V1Router.useRouters('/auth', AuthRouter)
V1Router.useRouters('/categories', CategoriesRouter)
V1Router.useRouters('/tags', TagsRouter)
V1Router.useRouters('/articles', ArticlesRouter)

export default V1Router
