import { afterAll, describe, expect, it, vi } from 'vitest'

import argon2 from 'argon2'

import { afterEach } from 'node:test'

import PasswordHashService from '../PasswordHashService'

describe('PasswordHashService', () => {
	vi.stubEnv('PASSWORD_HASH_SECRET', 'secret')

	afterEach(() => {
		vi.restoreAllMocks()
	})

	afterAll(() => {
		vi.unstubAllEnvs()
	})

	it('should hash password', async () => {
		const hashSpy = vi.spyOn(argon2, 'hash')

		const passwordHashService = new PasswordHashService()

		hashSpy.mockResolvedValue('passwordDigest')

		const digest = await passwordHashService.hash('password')

		expect(hashSpy).toHaveBeenCalledOnce()

		expect(digest).toBe('passwordDigest')
	})

	it('should verify password', async () => {
		const verifySpy = vi.spyOn(argon2, 'verify')

		const passwordHashService = new PasswordHashService()

		verifySpy.mockResolvedValue(true)

		const result = await passwordHashService.verify('passwordDigest', 'password')

		expect(verifySpy).toHaveBeenCalledOnce()

		expect(result).toBe(true)
	})

	it('should not verify invalid password', async () => {
		const verifySpy = vi.spyOn(argon2, 'verify')

		const passwordHashService = new PasswordHashService()

		verifySpy.mockRejectedValue(new TypeError())

		await expect(passwordHashService.verify('passwordDigest', 'password')).rejects.toThrowError(
			TypeError,
		)

		expect(verifySpy).toHaveBeenCalledOnce()
	})
})
