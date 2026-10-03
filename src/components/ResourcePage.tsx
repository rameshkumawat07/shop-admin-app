import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AddRounded, DeleteOutlineRounded, EditOutlined, ErrorOutlineRounded, MoreHorizRounded,
  SearchRounded, VisibilityOutlined,
} from '@mui/icons-material'
import {
  Alert, Avatar, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, InputAdornment, MenuItem, Paper, Snackbar, Table, TableBody,
  TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Tooltip,
} from '@mui/material'
import { EntityForm, type FieldConfig, type FormValues } from './EntityForm'
import { normalize } from '../utils/format'

export interface CrudApi {
  list: () => Promise<unknown[]>
  create: (data: Record<string, unknown>) => Promise<unknown>
  update: (id: string | number, data: Record<string, unknown>) => Promise<unknown>
  remove: (id: string | number) => Promise<void>
}
export interface ResourceColumn {
  key: string
  label: string
  format?: (value: unknown, row: Record<string, unknown>) => string
}

function display(value: unknown) {
  if (typeof value === 'number') return value.toLocaleString('en-US')
  return value === undefined || value === null || value === '' ? '—' : String(value)
}
function statusTone(value: unknown): 'success' | 'warning' | 'error' | 'info' | 'default' {
  const status = String(value).toLowerCase()
  if (['active', 'delivered', 'shipped'].includes(status)) return 'success'
  if (['low stock', 'pending', 'processing'].includes(status)) return 'warning'
  if (['inactive', 'cancelled'].includes(status)) return 'error'
  return 'default'
}

export function ResourcePage({ title, description, api, fields, columns, filterKey, filterLabel = 'Status', createPath, onChanged }: {
  title: string
  description: string
  api: CrudApi
  fields: FieldConfig[]
  columns: ResourceColumn[]
  filterKey?: string
  filterLabel?: string
  createPath: string
  onChanged?: () => void
}) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [page, setPage] = useState(0)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [viewing, setViewing] = useState<Record<string, unknown> | null>(null)
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null)
  const [notice, setNotice] = useState<{ message: string; severity: 'success' | 'error' } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { setRows(await api.list() as Record<string, unknown>[]) }
    catch (error) { setNotice({ message: error instanceof Error ? error.message : 'Unable to load records.', severity: 'error' }) }
    finally { setLoading(false) }
  }, [api])
  useEffect(() => {
    let mounted = true
    api.list().then((data) => { if (mounted) setRows(data as Record<string, unknown>[]) })
      .catch((error: unknown) => { if (mounted) setNotice({ message: error instanceof Error ? error.message : 'Unable to load records.', severity: 'error' }) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [api])

  const filters = useMemo(() => filterKey ? ['All', ...new Set(rows.map((row) => String(row[filterKey] ?? '')).filter(Boolean))] : ['All'], [filterKey, rows])
  const filtered = useMemo(() => rows.filter((row) => {
    const matchesSearch = Object.values(row).some((value) => String(value).toLowerCase().includes(query.toLowerCase()))
    return matchesSearch && (filter === 'All' || String(row[filterKey ?? '']) === filter)
  }), [filter, filterKey, query, rows])
  const pageCount = Math.max(1, Math.ceil(filtered.length / 10))
  const visiblePage = Math.min(page, pageCount - 1)
  const pageRows = filtered.slice(visiblePage * 10, visiblePage * 10 + 10)

  async function save(values: FormValues) {
    if (!editing) return
    setSaving(true)
    try {
      await api.update(editing.id as string | number, normalize(values, fields))
      setEditing(null)
      setNotice({ message: `${title.replace(/s$/, '')} updated successfully.`, severity: 'success' })
      await load()
      onChanged?.()
    } catch (error) { setNotice({ message: error instanceof Error ? error.message : 'Unable to update record.', severity: 'error' }) }
    finally { setSaving(false) }
  }

  async function remove() {
    if (!deleting) return
    setSaving(true)
    try {
      await api.remove(deleting.id as string | number)
      setDeleting(null)
      setNotice({ message: 'Record deleted successfully.', severity: 'success' })
      await load()
      onChanged?.()
    } catch (error) { setNotice({ message: error instanceof Error ? error.message : 'Unable to delete record.', severity: 'error' }) }
    finally { setSaving(false) }
  }

  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><p className="mb-1 text-xs font-bold uppercase tracking-[.14em] text-[#6c957b]">Management</p><h2 className="font-heading mb-1 text-2xl font-extrabold">{title}</h2><p className="m-0 text-sm text-[var(--muted)]">{description}</p></div>
      <Button href={createPath} variant="contained" startIcon={<AddRounded />} sx={{ bgcolor: '#246b4b', '&:hover': { bgcolor: '#194d36' }, textTransform: 'none', borderRadius: 2, px: 2.2, py: 1.1, whiteSpace: 'nowrap' }}>Add {title.replace(/s$/, '')}</Button>
    </div>
    <Paper elevation={0} className="content-surface overflow-hidden rounded-xl border border-[var(--line)]">
      <div className="flex flex-col gap-3 border-b border-[var(--line)] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div><h3 className="m-0 text-sm font-bold">All records <span className="ml-1 rounded-full bg-[#edf3ee] px-2 py-0.5 text-[10px] text-[#477456]">{filtered.length}</span></h3><p className="mb-0 mt-1 text-xs text-[var(--muted)]">A complete view of your {title.toLowerCase()}.</p></div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <TextField size="small" placeholder={`Search ${title.toLowerCase()}…`} value={query} onChange={(event) => { setQuery(event.target.value); setPage(0) }} sx={{ minWidth: { sm: 220 }, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 } }} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRounded sx={{ fontSize: 19, color: '#8b958d' }} /></InputAdornment> } }} />
          {filterKey && <TextField select size="small" value={filter} onChange={(event) => { setFilter(event.target.value); setPage(0) }} label={filterLabel} sx={{ minWidth: 135, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13 } }}>{filters.map((value) => <MenuItem key={value} value={value}>{value === 'All' ? `All ${filterLabel.toLowerCase()}s` : value}</MenuItem>)}</TextField>}
        </div>
      </div>
      {loading ? <div className="flex min-h-56 items-center justify-center"><CircularProgress size={26} sx={{ color: '#246b4b' }} /></div> : rows.length === 0 ? <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center"><Avatar sx={{ width: 48, height: 48, bgcolor: '#eff5f0', color: '#60816b' }}><ErrorOutlineRounded /></Avatar><h3 className="mb-1 mt-4 text-sm font-bold">Nothing here yet</h3><p className="mb-4 text-xs text-[var(--muted)]">Add your first record to get started.</p><Button href={createPath} size="small" variant="outlined" startIcon={<AddRounded />} sx={{ textTransform: 'none' }}>Create a record</Button></div> : <TableContainer sx={{ overflowX: 'hidden' }}><Table size="small" sx={{ width: '100%', tableLayout: 'fixed' }}>
        <TableHead><TableRow>{columns.map((column, index) => <TableCell key={column.key} sx={{ display: { xs: index > 1 ? 'none' : 'table-cell', sm: 'table-cell' }, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.09em', color: '#758078', bgcolor: '#f8faf8', py: 1.5, px: { xs: 1, sm: 2 }, overflowWrap: 'anywhere' }}>{column.label}</TableCell>)}<TableCell align="right" sx={{ width: { xs: 112, sm: 150 }, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.09em', color: '#758078', bgcolor: '#f8faf8', px: { xs: 0.5, sm: 2 } }}>Actions</TableCell></TableRow></TableHead>
        <TableBody>{pageRows.map((row) => <TableRow key={String(row.id)} hover>
          {columns.map((column, index) => <TableCell key={column.key} sx={{ display: { xs: index > 1 ? 'none' : 'table-cell', sm: 'table-cell' }, fontSize: 12, py: 1.8, px: { xs: 1, sm: 2 }, overflowWrap: 'anywhere' }}>
            {column.key === 'status' ? <Chip size="small" label={display(row[column.key])} color={statusTone(row[column.key])} variant="outlined" sx={{ height: 23, fontSize: 10, fontWeight: 700, '& .MuiChip-label': { px: 1 } }} /> : <span className={column.key === columns[0]?.key ? 'font-semibold' : 'text-[var(--muted)]'}>{column.format ? column.format(row[column.key], row) : display(row[column.key])}</span>}
          </TableCell>)}
          <TableCell align="right" sx={{ whiteSpace: 'nowrap', px: { xs: 0.25, sm: 1 } }}>
            <Tooltip title="View details"><IconButton size="small" onClick={() => setViewing(row)} aria-label="View details" sx={{ p: { xs: 0.5, sm: 1 } }}><VisibilityOutlined sx={{ fontSize: 17 }} /></IconButton></Tooltip>
            <Tooltip title="Edit"><IconButton size="small" onClick={() => setEditing(row)} aria-label="Edit" sx={{ p: { xs: 0.5, sm: 1 } }}><EditOutlined sx={{ fontSize: 17 }} /></IconButton></Tooltip>
            <Tooltip title="Delete"><IconButton size="small" onClick={() => setDeleting(row)} aria-label="Delete" sx={{ p: { xs: 0.5, sm: 1 } }}><DeleteOutlineRounded sx={{ fontSize: 17 }} /></IconButton></Tooltip>
          </TableCell>
        </TableRow>)}</TableBody>
      </Table>{filtered.length === 0 && <div className="p-10 text-center text-sm text-[var(--muted)]"><MoreHorizRounded className="mb-1" /> No matching records found.</div>}</TableContainer>}
      {!loading && rows.length > 0 && <TablePagination component="div" count={filtered.length} page={visiblePage} onPageChange={(_, nextPage) => setPage(nextPage)} rowsPerPage={10} rowsPerPageOptions={[10]} labelRowsPerPage="Rows per page:" sx={{ borderTop: '1px solid var(--line)', color: 'var(--muted)', '& .MuiTablePagination-toolbar': { minHeight: 52, px: { xs: 1, sm: 2 } }, '& .MuiTablePagination-displayedRows': { fontSize: 11 } }} />}
      <div className="flex items-center justify-between border-t border-[var(--line)] px-5 py-3 text-[11px] text-[var(--muted)]"><span>Showing {filtered.length ? visiblePage * 10 + 1 : 0}–{Math.min((visiblePage + 1) * 10, filtered.length)} of {filtered.length} records</span><span>Live data</span></div>
    </Paper>

    <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} fullWidth maxWidth="md"><DialogTitle className="font-heading !font-bold">Edit {title.replace(/s$/, '')}</DialogTitle><DialogContent><p className="mb-5 text-sm text-[var(--muted)]">Update the record details below.</p>{editing && <EntityForm fields={fields} initialValues={editing} submitLabel="Save changes" loading={saving} onSubmit={save} onCancel={() => setEditing(null)} />}</DialogContent></Dialog>
    <Dialog open={Boolean(viewing)} onClose={() => setViewing(null)} fullWidth maxWidth="sm"><DialogTitle className="font-heading !font-bold">{title.replace(/s$/, '')} details</DialogTitle><DialogContent><div className="divide-y divide-[var(--line)]">{viewing && Object.entries(viewing).filter(([key]) => key !== 'id').map(([key, value]) => <div key={key} className="flex items-start justify-between gap-4 py-3"><span className="text-xs capitalize text-[var(--muted)]">{key.replace(/([A-Z])/g, ' $1')}</span><span className="text-right text-sm font-semibold">{display(value)}</span></div>)}</div></DialogContent><DialogActions><Button onClick={() => setViewing(null)}>Close</Button></DialogActions></Dialog>
    <Dialog open={Boolean(deleting)} onClose={() => setDeleting(null)}><DialogTitle className="font-heading !font-bold">Delete this record?</DialogTitle><DialogContent><p className="m-0 text-sm text-[var(--muted)]">This action can’t be undone. The record will be permanently removed.</p></DialogContent><DialogActions><Button onClick={() => setDeleting(null)} color="inherit">Cancel</Button><Button onClick={() => void remove()} disabled={saving} color="error" variant="contained">Delete</Button></DialogActions></Dialog>
    <Snackbar open={Boolean(notice)} autoHideDuration={4500} onClose={() => setNotice(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert onClose={() => setNotice(null)} severity={notice?.severity} variant="filled">{notice?.message}</Alert></Snackbar>
  </div>
}

