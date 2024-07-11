import { ExpressRouter } from 'Internals'

import AuthRouter from 'Versions/V1/Routes/Auth'

import CategoriesRouter from './Categories'

const V1Router = new ExpressRouter({ strict: true })

V1Router.useRouters('/auth', AuthRouter)
V1Router.useRouters('/categories', CategoriesRouter)

export default V1Router
