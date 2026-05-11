import '@testing-library/jest-dom'

import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

if (!global.TextEncoder) {
	global.TextEncoder = TextEncoder as typeof global.TextEncoder
}

if (!global.TextDecoder) {
	global.TextDecoder = TextDecoder as typeof global.TextDecoder
}

