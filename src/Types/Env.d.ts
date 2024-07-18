declare global {
	namespace NodeJS {
		interface ProcessEnv {
			PORT: string
			DATABASE_URL: string
			JWT_SECRET: string
			REFRESH_JWT_SECRET: string
			JWT_EXPIRE: string
			REFRESH_JWT_EXPIRE: string
			LOG_LEVEL: string
			NODE_ENV: string
		}
	}
}

export {}
