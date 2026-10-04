import type { FieldConfig, FormValues } from '../components/EntityForm'

export function formatMoney(value: unknown) {
  return typeof value === 'number' ? value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value === undefined || value === null || value === '' ? '—' : String(value)
}

export function formatCompactMoney(value: number) {
  return `₹${(value / 1000).toLocaleString('en-IN', { maximumFractionDigits: 1 })}k`
}

export function normalize(values: FormValues, fields: FieldConfig[]) {
  const numeric = new Set(fields.filter((field) => field.type === 'number').map((field) => field.name))
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, numeric.has(key) ? Number(value) : value]))
}
