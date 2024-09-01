import * as Minio from 'minio'

import Logger from 'Utils/Logger/Logger'

export enum MinioBucket {
	ArticlesImages = 'ArticlesImages',
}

const MinioClient = new Minio.Client({
	endPoint: process.env.MINIO_ENDPOINT,
	port: parseInt(process.env.MINIO_PORT, 10),
	useSSL: true,
	accessKey: process.env.MINIO_ACCESS_KEY,
	secretKey: process.env.MINIO_SECRET_KEY,
})

for (const bucket of Object.values(MinioBucket)) {
	const exists = await MinioClient.bucketExists(bucket)

	if (exists) continue

	Logger.info(`Minio bucket "${bucket}" does not exist.`)

	await MinioClient.makeBucket(bucket, 'us-east-1')

	Logger.info(`Minio bucket "${bucket}" created.`)
}

export default MinioClient
