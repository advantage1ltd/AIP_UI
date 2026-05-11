/** Stolen-line recovery calculations for IncidentForm. */
import type { StolenItem } from '@/types/incidents'

export const toSafeNumber = (value: number | string | undefined | null) => {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export const calculateItemRecoveryMetrics = (item: StolenItem) => {
  const cost = Math.max(0, toSafeNumber(item.cost))
  const quantity = Math.max(0, Math.floor(toSafeNumber(item.quantity)))
  const isRecovered = Boolean(item.isRecovered)
  const rawRecovered = Math.max(0, Math.floor(toSafeNumber(item.recoveredQuantity)))
  const recoveredQuantity = isRecovered ? Math.min(rawRecovered, quantity) : 0
  const totalAmount = cost * quantity
  const valueSaved = cost * recoveredQuantity
  const valueLost = totalAmount - valueSaved

  return {
    ...item,
    cost,
    quantity,
    isRecovered,
    recoveredQuantity,
    totalAmount,
    valueSaved,
    valueLost,
  }
}

export const hydrateStolenItems = (items: StolenItem[] = []) => items.map(calculateItemRecoveryMetrics)
