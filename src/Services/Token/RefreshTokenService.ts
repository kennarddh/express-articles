import TokenService from './TokenService'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type IRefreshTokenJWTPayload = {
	id: number
}

class RefreshTokenService extends TokenService<IRefreshTokenJWTPayload> {
	constructor() {
		super(process.env.REFRESH_JWT_SECRET, {
			expiresIn: parseInt(process.env.REFRESH_JWT_EXPIRE, 10),
		})
	}
}

export default RefreshTokenService
