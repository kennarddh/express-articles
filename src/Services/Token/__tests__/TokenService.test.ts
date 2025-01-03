import { assertType, describe, expect, it } from 'vitest'

import jwt from 'jsonwebtoken'

import TokenExpiredError from '../Errors/TokenExpiredError'
import TokenVerifyError from '../Errors/TokenVerifyError'
import TokenService from '../TokenService'

describe('TokenService', () => {
	it('should sign token', async () => {
		const tokenService = new TokenService('secret', { expiresIn: '1h' })

		const token = await tokenService.sign({ id: 1 })

		assertType<string>(token)

		const decoded = jwt.decode(token) as { id: number }

		expect(decoded.id).toBe(1)
	})

	it('should verify token', async () => {
		const tokenService = new TokenService<{ id: number }>('secret', { expiresIn: '1h' })

		const token = await tokenService.sign({ id: 1 })

		const result = await tokenService.verify(token)

		assertType<number>(result.id)

		const decoded = jwt.decode(token) as { id: number }

		expect(result.id).toBe(decoded.id)
	})

	it('should fail to verify expired token', async () => {
		const tokenService = new TokenService<{ id: number }>('secret', { expiresIn: '1h' })

		const token =
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzM1MTQ1NTIxLCJleHAiOjE3MzUxNDkxMn0.-ltS7vTteSWo1zosYMPCHZLgeIqF8AW00d6fvTV-alg'

		await expect(() => tokenService.verify(token)).rejects.toThrowError(TokenExpiredError)
	})

	it('should fail to verify invalid token', async () => {
		const tokenService = new TokenService<{ id: number }>('secret', { expiresIn: '1h' })

		const token = 'invalid'

		await expect(() => tokenService.verify(token)).rejects.toThrowError(TokenVerifyError)
	})
})
