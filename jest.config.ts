import { type JestConfigWithTsJest, createDefaultEsmPreset, pathsToModuleNameMapper } from 'ts-jest'

import { compilerOptions } from './tsconfig.json'

const presetConfig = createDefaultEsmPreset({
	//...options
})

const jestConfig: JestConfigWithTsJest = {
	...presetConfig,
	roots: ['<rootDir>'],
	modulePaths: [compilerOptions.baseUrl],
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { useESM: true })!,
}

export default jestConfig
