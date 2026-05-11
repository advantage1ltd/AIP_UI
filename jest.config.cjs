module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1'
	},
	setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
	testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
	collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts']
}

module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
	transform: {
		'^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
	},
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
	},
	testMatch: ['**/?(*.)+(test).[tj]s?(x)'],
	collectCoverageFrom: [
		'src/**/*.{ts,tsx}',
		'!src/**/*.d.ts',
	],
}

