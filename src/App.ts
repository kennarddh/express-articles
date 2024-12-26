import compression from 'compression'

import helmet from 'helmet'

import { CelosiaInstance, ConvertExpressMiddleware } from '@celosiajs/core'

import DatabaseRepository from 'Repositories/DatabaseRepository'

import Cors from 'Middlewares/Cors'
import LogHttpRequest from 'Middlewares/LogHttpRequest'

import Router from 'Routes'

await DatabaseRepository.connect()

const Instance = new CelosiaInstance({ strict: true })

// Middleware
Instance.useMiddlewares(new (ConvertExpressMiddleware(compression()))())
Instance.useMiddlewares(new (ConvertExpressMiddleware(helmet()))())
Instance.useMiddlewares(new Cors())
Instance.useMiddlewares(new LogHttpRequest())

Instance.useRouters(Router)

export default Instance
