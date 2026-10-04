import { useState } from 'react'
import { Alert, Button, MenuItem, TextField } from '@mui/material'

export interface FieldOption { label: string; value: string | number }
export interface FieldConfig {
  name: string
  label: string
  type?: 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea'
  required?: boolean
  options?: FieldOption[]
  min?: number
  helperText?: string
}
export type FormValues = Record<string, string | number>

function initialFormValues(fields: FieldConfig[], initialValues: Record<string, unknown>): FormValues {
  return Object.fromEntries(fields.map((field) => {
    const value = initialValues[field.name]
    return [field.name, typeof value === 'string' || typeof value === 'number' ? value : '']
  }))
}

export function EntityForm({ fields, initialValues = {}, submitLabel, loading, onSubmit, onCancel }: {
  fields: FieldConfig[]
  initialValues?: Record<string, unknown>
  submitLabel: string
  loading?: boolean
  onSubmit: (values: FormValues) => void | Promise<void>
  onCancel?: () => void
}) {
  const [values, setValues] = useState<FormValues>(() => initialFormValues(fields, initialValues))
  const [errors, setErrors] = useState<Record<string, string>>({})

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    fields.forEach((field) => {
      const value = values[field.name]
      const empty = value === undefined || value === ''
      if (field.required && empty) nextErrors[field.name] = `${field.label} is required.`
      else if (field.type === 'email' && !empty && !/^\S+@\S+\.\S+$/.test(String(value))) nextErrors[field.name] = 'Enter a valid email address.'
      else if (field.type === 'number' && !empty && (Number.isNaN(Number(value)) || Number(value) < (field.min ?? 0))) nextErrors[field.name] = `${field.label} must be at least ${field.min ?? 0}.`
    })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) void onSubmit(values)
  }

  return <form onSubmit={submit} className="space-y-4" noValidate>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map((field) => <TextField
        key={field.name}
        fullWidth
        size="small"
        label={field.label}
        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'email' ? 'email' : 'text'}
        select={field.type === 'select'}
        multiline={field.type === 'textarea'}
        minRows={field.type === 'textarea' ? 3 : undefined}
        value={values[field.name] ?? ''}
        onChange={(event) => setValues((current) => ({ ...current, [field.name]: field.type === 'number' ? event.target.value : event.target.value }))}
        error={Boolean(errors[field.name])}
        helperText={errors[field.name] ?? field.helperText}
        required={field.required}
        slotProps={{
          inputLabel: field.type === 'date' ? { shrink: true } : undefined,
          htmlInput: field.type === 'number' ? { min: field.min ?? 0, step: 'any' } : undefined,
        }}
      >{field.options?.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</TextField>)}
    </div>
    <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--line)] pt-4">
      {onCancel && <Button onClick={onCancel} color="inherit">Cancel</Button>}
      <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: '#246b4b', '&:hover': { bgcolor: '#194d36' }, textTransform: 'none', borderRadius: 2, px: 2.5 }}>{loading ? 'Saving…' : submitLabel}</Button>
    </div>
    {Object.keys(errors).length > 0 && <Alert severity="error">Please correct the highlighted fields.</Alert>}
  </form>
}
