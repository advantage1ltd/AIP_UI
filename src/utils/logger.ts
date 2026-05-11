/**
 * Client logging: verbose output only when VITE_DEBUG_LOGS=true in development.
 * Production keeps errors (without dumping API bodies by default at call sites).
 */
const debugLogsEnabled = import.meta.env.DEV && import.meta.env.VITE_DEBUG_LOGS === 'true'

export const logger = {
	debug: (...args: unknown[]) => {
		if (debugLogsEnabled) console.debug(...args)
	},
	info: (...args: unknown[]) => {
		if (debugLogsEnabled) console.info(...args)
	},
	warn: (...args: unknown[]) => {
		if (debugLogsEnabled) console.warn(...args)
	},
	error: (...args: unknown[]) => {
		console.error(...args)
	},
}
