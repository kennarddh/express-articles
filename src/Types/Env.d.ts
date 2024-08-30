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
			MINIO_ENDPOINT: string
			MINIO_PORT: string
			MINIO_ACCESS_KEY: string
			MINIO_SECRET_KEY: string
		}
	}
}

export {}
