import { Mocked, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import UserRepository, { IUser, UserRole } from 'Repositories/UserRepository'
import PasswordHashService from 'Services/PasswordHashService/PasswordHashService'
import AccessTokenService from 'Services/Token/AccessTokenService'
import TokenExpiredError from 'Services/Token/Errors/TokenExpiredError'
import RefreshTokenService from 'Services/Token/RefreshTokenService'

import UnauthorizedError from '../Errors/UnauthorizedError'
import UserExistsError from '../Errors/UserExistsError'
import UserService from '../UserService'

vi.mock('Repositories/UserRepository')
vi.mock('Services/PasswordHashService/PasswordHashService')
vi.mock('Services/Token/AccessTokenService')
vi.mock('Services/Token/RefreshTokenService')

describe('UserService', () => {
	let userService: UserService
	let userRepositoryMock: Mocked<UserRepository>
	let passwordHashServiceMock: Mocked<PasswordHashService>
	let accessTokenServiceMock: Mocked<AccessTokenService>
	let refreshTokenServiceMock: Mocked<RefreshTokenService>

	const username = 'testuser'
	const name = 'Test User'
	const password = 'password'
	const passwordDigest = 'hashedPassword'
	const role = UserRole.User

	let user: IUser

	beforeEach(() => {
		vi.stubEnv('JWT_SECRET', 'secret')
		vi.stubEnv('JWT_EXPIRE', '60')
		vi.stubEnv('REFRESH_JWT_SECRET', 'refreshSecret')
		vi.stubEnv('REFRESH_JWT_EXPIRE', '3600')

		userRepositoryMock = vi.mocked(new UserRepository())
		passwordHashServiceMock = vi.mocked(new PasswordHashService())
		accessTokenServiceMock = vi.mocked(new AccessTokenService())
		refreshTokenServiceMock = vi.mocked(new RefreshTokenService())

		userService = new UserService(
			userRepositoryMock,
			passwordHashServiceMock,
			accessTokenServiceMock,
			refreshTokenServiceMock,
		)

		user = {
			id: 1,
			username,
			name,
			password: passwordDigest,
			role,
			createdAt: new Date(),
		}
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	it('should register a new user', async () => {
		passwordHashServiceMock.hash.mockResolvedValue(passwordDigest)
		userRepositoryMock.getByUsername.mockResolvedValue(null)
		userRepositoryMock.create.mockResolvedValue(user)

		const result = await userService.register(username, name, password)

		expect(passwordHashServiceMock.hash).toHaveBeenCalledWith(password)
		expect(userRepositoryMock.create).toHaveBeenCalledWith(username, name, passwordDigest)
		expect(result).toEqual(user)
	})

	it('should throw UserExistsError if username already exists during registration', async () => {
		userRepositoryMock.getByUsername.mockResolvedValue(user)

		await expect(userService.register(username, 'Existing', 'password')).rejects.toThrowError(
			UserExistsError,
		)

		expect(userRepositoryMock.create).not.toHaveBeenCalled()
	})

	it('should log in an existing user', async () => {
		const tokens = { accessToken: 'access', refreshToken: 'refresh' }

		userRepositoryMock.getByUsername.mockResolvedValue(user)
		passwordHashServiceMock.verify.mockResolvedValue(true)
		accessTokenServiceMock.sign.mockResolvedValue(tokens.accessToken)
		refreshTokenServiceMock.sign.mockResolvedValue(tokens.refreshToken)

		const result = await userService.login(username, password)

		expect(userRepositoryMock.getByUsername).toHaveBeenCalledWith(username)
		expect(passwordHashServiceMock.verify).toHaveBeenCalledWith(passwordDigest, password)
		expect(accessTokenServiceMock.sign).toHaveBeenCalledWith({ id: user.id })
		expect(refreshTokenServiceMock.sign).toHaveBeenCalledWith({ id: user.id })

		expect(result).toEqual(tokens)
	})

	it('should throw UnauthorizedError if username does not exist during login', async () => {
		userRepositoryMock.getByUsername.mockResolvedValue(null)

		await expect(userService.login('nonexistentuser', 'password')).rejects.toThrowError(
			UnauthorizedError,
		)

		expect(passwordHashServiceMock.verify).not.toHaveBeenCalled()
	})

	it('should throw UnauthorizedError if password is incorrect during login', async () => {
		userRepositoryMock.getByUsername.mockResolvedValue(user)
		passwordHashServiceMock.verify.mockResolvedValue(false)

		await expect(userService.login(username, password)).rejects.toThrowError(UnauthorizedError)
	})

	it('should refresh tokens', async () => {
		const refreshToken = 'refreshToken'

		const tokens = { accessToken: 'newAccessToken', refreshToken: 'newRefreshToken' }

		refreshTokenServiceMock.verify.mockResolvedValue({ id: user.id })

		accessTokenServiceMock.sign.mockResolvedValue(tokens.accessToken)
		refreshTokenServiceMock.sign.mockResolvedValue(tokens.refreshToken)

		const result = await userService.refreshToken(refreshToken)

		expect(refreshTokenServiceMock.verify).toHaveBeenCalledWith(refreshToken)
		expect(accessTokenServiceMock.sign).toHaveBeenCalledWith({ id: user.id })
		expect(refreshTokenServiceMock.sign).toHaveBeenCalledWith({ id: user.id })

		expect(result).toEqual(tokens)
	})

	it('should not refresh tokens with expired refresh token', async () => {
		const refreshToken = 'refreshToken'

		refreshTokenServiceMock.verify.mockRejectedValue(new TokenExpiredError(new Date()))

		await expect(userService.refreshToken(refreshToken)).rejects.toThrowError(TokenExpiredError)

		expect(refreshTokenServiceMock.verify).toHaveBeenCalledWith(refreshToken)
		expect(accessTokenServiceMock.sign).not.toHaveBeenCalled()
		expect(refreshTokenServiceMock.sign).not.toHaveBeenCalled()
	})

	it('should get user data', async () => {
		userRepositoryMock.getByID.mockResolvedValue(user)

		const result = await userService.getUserData(user.id)

		expect(userRepositoryMock.getByID).toHaveBeenCalledWith(user.id)

		expect(result).toEqual(user)
	})
})
