import argon2 from 'argon2'

import ServiceError from 'Services/Errors/ServiceError'

import Logger from 'Utils/Logger/Logger'

import Service from '../Service'

class PasswordHashService extends Service {
	async hash(password: string): Promise<string> {
		try {
			return await argon2.hash(password, {
				hashLength: 64,
				secret: Buffer.from(process.env.PASSWORD_HASH_SECRET),
			})
		} catch (error) {
			Logger.error('PasswordHashService.hash', error)

			throw new ServiceError()
		}
	}

	async verify(digest: string, password: string): Promise<boolean> {
		try {
			return await argon2.verify(digest, password, {
				secret: Buffer.from(process.env.PASSWORD_HASH_SECRET),
			})
		} catch (error) {
			if (error instanceof TypeError) {
				throw new TypeError('Invalid digest')
			}

			Logger.error('PasswordHashService.verify', error)

			throw new ServiceError()
		}
	}
}

export default PasswordHashService
