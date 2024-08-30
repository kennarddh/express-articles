import * as Minio from 'minio'

const MinioClient = new Minio.Client({
	endPoint: process.env.MINIO_ENDPOINT,
	port: parseInt(process.env.MINIO_PORT, 10),
	useSSL: true,
	accessKey: process.env.MINIO_ACCESS_KEY,
	secretKey: process.env.MINIO_SECRET_KEY,
})

export default MinioClient
