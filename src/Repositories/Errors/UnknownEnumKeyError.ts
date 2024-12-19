class UnknownEnumKeyError extends Error {
	constructor(
		public enumName: string,
		public enumKey: string,
	) {
		super(`Unknown enum key '${enumKey}' for enum ${enumName}`)
	}
}

export default UnknownEnumKeyError
