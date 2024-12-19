import UserRepository from 'Repositories/UserRepository'
import PasswordHashService from 'Services/PasswordHashService'
import AccessTokenService, { IAccessTokenJWTPayload } from 'Services/Token/AccessTokenService'
import RefreshTokenService, { IRefreshTokenJWTPayload } from 'Services/Token/RefreshTokenService'

import Service from '../Service'
import UnauthorizedError from './Errors/UnauthorizedError'
import UserExistsError from './Errors/UserExistsError'

class UserService extends Service {
	constructor(
		private userRepository = new UserRepository(),
		private passwordHashService = new PasswordHashService(),
		private accessTokenService = new AccessTokenService(),
		private refreshTokenService = new RefreshTokenService(),
	) {
		super()
	}

	getUserData(id: number) {
		return this.userRepository.getByID(id)
	}

	async createTokens(userID: number) {
		const accessTokenPayload = { id: userID } satisfies IAccessTokenJWTPayload

		const accessToken = await this.accessTokenService.sign(accessTokenPayload)

		const refreshTokenPayload = { id: userID } satisfies IRefreshTokenJWTPayload

		const refreshToken = await this.refreshTokenService.sign(refreshTokenPayload)

		return {
			accessToken,
			refreshToken,
		}
	}

	async login(username: string, password: string) {
		const user = await this.userRepository.getByUsername(username)

		if (user === null) throw new UnauthorizedError()

		const isPasswordCorrect = await this.passwordHashService.verify(user.password, password)

		if (!isPasswordCorrect) throw new UnauthorizedError()

		return this.createTokens(user.id)
	}

	async register(username: string, name: string, password: string) {
		const user = await this.userRepository.getByUsername(username)

		if (user !== null) throw new UserExistsError()

		const passwordDigest = await this.passwordHashService.hash(password)

		const createdUser = await this.userRepository.create(username, name, passwordDigest)

		return createdUser
	}

	async refreshToken(refreshToken: string) {
		const currentRefreshTokenPayload = await this.refreshTokenService.verify(refreshToken)

		return this.createTokens(currentRefreshTokenPayload.id)
	}
}

export default UserService
