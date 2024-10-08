import { CelosiaRouter } from '@celosiajs/core'

import NoMatchController from 'Controllers/NoMatchController'

import V1Router from 'Versions/V1/Routes/index'

const Router = new CelosiaRouter({ strict: true })

Router.useRouters('/v1', V1Router)

Router.all('*', [], new NoMatchController())

export default Router
