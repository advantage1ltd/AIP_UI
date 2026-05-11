import { act, renderHook } from '@testing-library/react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'

describe('useDebouncedValue', () => {
	beforeEach(() => {
		jest.useFakeTimers()
	})

	afterEach(() => {
		jest.useRealTimers()
	})

	it('returns the latest value only after the delay', () => {
		const { result, rerender } = renderHook(
			({ value, delayMs }) => useDebouncedValue(value, delayMs),
			{ initialProps: { value: 'initial', delayMs: 300 } }
		)

		expect(result.current).toBe('initial')

		rerender({ value: 'updated', delayMs: 300 })
		expect(result.current).toBe('initial')

		act(() => {
			jest.advanceTimersByTime(299)
		})
		expect(result.current).toBe('initial')

		act(() => {
			jest.advanceTimersByTime(1)
		})
		expect(result.current).toBe('updated')
	})
})
