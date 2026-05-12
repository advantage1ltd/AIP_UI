module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
	transform: {
		'^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
	},
	moduleNameMapper: {
		'^@/utils/logger$': '<rootDir>/src/test/mocks/logger.ts',
		'^@/(.*)$': '<rootDir>/src/$1',
	},
	testMatch: ['**/?(*.)+(test).[tj]s?(x)'],
	collectCoverageFrom: [
		'src/**/*.{ts,tsx}',
		'!src/**/*.d.ts',
	],
}
