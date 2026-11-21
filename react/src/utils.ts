import type { DebtStatus } from './api'

export const STATUS_LABELS: Record<DebtStatus, string> = {
  pending: 'Интизор',
  partial: 'Қисман',
  paid: 'Пардохт шуд',
}

export function formatMoney(amount: number | string) {
  return Number(amount).toLocaleString('ru-RU') + ' сомонӣ'
}

export function formatDate(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('ru-RU')
}

export function today() {
  return new Date().toISOString().slice(0, 10)
}