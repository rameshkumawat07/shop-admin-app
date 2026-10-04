import { useEffect, useMemo, useState } from 'react'
import { ArrowBackRounded, CheckCircleOutlineRounded, Inventory2Outlined } from '@mui/icons-material'
import { Alert, Breadcrumbs, Button, CircularProgress, Paper, Snackbar } from '@mui/material'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { categoryApi } from '../api/categoryApi'
import { inventoryApi } from '../api/inventoryApi'
import { orderApi } from '../api/orderApi'
import { saleApi } from '../api/saleApi'
import { vendorApi } from '../api/vendorApi'
import type { Category, InventoryItem, Order, Sale, Vendor } from '../api/types'
import { EntityForm, type FieldConfig, type FormValues } from '../components/EntityForm'
import { ResourcePage, type CrudApi, type ResourceColumn } from '../components/ResourcePage'
import { formatMoney, normalize } from '../utils/format'

const inventoryCrud: CrudApi = {
  list: inventoryApi.list,
  create: (data) => inventoryApi.create(data as Omit<InventoryItem, 'id'>),
  update: (id, data) => inventoryApi.update(id, data as Partial<InventoryItem>),
  remove: inventoryApi.remove,
}
const vendorCrud: CrudApi = {
  list: vendorApi.list,
  create: (data) => vendorApi.create(data as Omit<Vendor, 'id'>),
  update: (id, data) => vendorApi.update(id, data as Partial<Vendor>),
  remove: vendorApi.remove,
}
const categoryCrud: CrudApi = {
  list: categoryApi.list,
  create: (data) => categoryApi.create(data as Omit<Category, 'id'>),
  update: (id, data) => categoryApi.update(id, data as Partial<Category>),
  remove: categoryApi.remove,
}
const orderCrud: CrudApi = {
  list: orderApi.list,
  create: (data) => orderApi.create(data as Omit<Order, 'id'>),
  update: (id, data) => orderApi.update(id, data as Partial<Order>),
  remove: orderApi.remove,
}
const saleCrud: CrudApi = {
  list: saleApi.list,
  create: (data) => saleApi.create(data as Omit<Sale, 'id'>),
  update: (id, data) => saleApi.update(id, data as Partial<Sale>),
  remove: saleApi.remove,
}

const categoryFields: FieldConfig[] = [
  { name: 'name', label: 'Category name', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'status', label: 'Status', type: 'select', required: true, options: [{ label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' }] },
]
const vendorFields: FieldConfig[] = [
  { name: 'name', label: 'Vendor name', required: true },
  { name: 'contactPerson', label: 'Contact person', required: true },
  { name: 'phone', label: 'Phone', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'address', label: 'Address' },
  { name: 'gstNumber', label: 'GST number' },
]
const orderFields: FieldConfig[] = [
  { name: 'vendorId', label: 'Vendor', type: 'select', required: true },
  { name: 'date', label: 'Order date', type: 'date', required: true },
  { name: 'items', label: 'Number of items', type: 'number', min: 1, required: true },
  { name: 'total', label: 'Order total (₹)', type: 'number', min: 0, required: true },
  { name: 'status', label: 'Status', type: 'select', required: true, options: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((value) => ({ label: value, value })) },
]
const categoryColumns: ResourceColumn[] = [
  { key: 'name', label: 'Category' }, { key: 'description', label: 'Description' }, { key: 'status', label: 'Status' },
]
const vendorColumns: ResourceColumn[] = [
  { key: 'name', label: 'Vendor' }, { key: 'contactPerson', label: 'Contact person' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' },
]
const orderColumns: ResourceColumn[] = [
  { key: 'orderNumber', label: 'Order ID' }, { key: 'vendorName', label: 'Vendor' }, { key: 'date', label: 'Date' }, { key: 'items', label: 'Items' }, { key: 'total', label: 'Total', format: formatMoney }, { key: 'status', label: 'Status' },
]
const saleColumns: ResourceColumn[] = [
  { key: 'saleNumber', label: 'Sale ID' }, { key: 'productName', label: 'Product' }, { key: 'customer', label: 'Customer' }, { key: 'quantity', label: 'Qty' }, { key: 'total', label: 'Total', format: formatMoney }, { key: 'date', label: 'Date' },
]

function inventoryFields(categories: Category[], vendors: Vendor[]): FieldConfig[] {
  return [
    { name: 'name', label: 'Product name', required: true },
    { name: 'sku', label: 'SKU', required: true },
    { name: 'categoryId', label: 'Category', type: 'select', required: true, options: categories.map((item) => ({ label: item.name, value: item.id })) },
    { name: 'vendorId', label: 'Vendor', type: 'select', required: true, options: vendors.map((item) => ({ label: item.name, value: item.id })) },
    { name: 'quantity', label: 'Quantity in stock', type: 'number', min: 0, required: true },
    { name: 'purchasePrice', label: 'Purchase price (₹)', type: 'number', min: 0, required: true },
    { name: 'sellingPrice', label: 'Selling price (₹)', type: 'number', min: 0, required: true },
    { name: 'status', label: 'Status', type: 'select', required: true, options: ['Active', 'Low stock', 'Inactive'].map((value) => ({ label: value, value })) },
    { name: 'description', label: 'Description', type: 'textarea' },
  ]
}
function saleFields(inventory: InventoryItem[]): FieldConfig[] {
  return [
    { name: 'productId', label: 'Product', type: 'select', required: true, options: inventory.filter((item) => item.quantity > 0).map((item) => ({ label: `${item.name} · ${item.quantity} available`, value: item.id })) },
    { name: 'quantity', label: 'Quantity', type: 'number', min: 1, required: true },
    { name: 'customer', label: 'Customer name', required: true },
    { name: 'date', label: 'Sale date', type: 'date', required: true },
  ]
}

function useReferenceData(includeInventory = false) {
  const [data, setData] = useState<{ categories: Category[]; vendors: Vendor[]; inventory: InventoryItem[] }>({ categories: [], vendors: [], inventory: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    const requests: [Promise<unknown>, Promise<unknown>, Promise<unknown>] = [categoryApi.list(), vendorApi.list(), includeInventory ? inventoryApi.list() : Promise.resolve([])]
    Promise.all(requests).then(([categories, vendors, inventory]) => setData({ categories: categories as Category[], vendors: vendors as Vendor[], inventory: inventory as InventoryItem[] }))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Could not load related data.'))
      .finally(() => setLoading(false))
  }, [includeInventory])
  return { ...data, loading, error }
}

function configFor(kind: string, categories: Category[], vendors: Vendor[]): { title: string; description: string; api: CrudApi; fields: FieldConfig[]; columns: ResourceColumn[]; filterKey?: string } | null {
  if (kind === 'inventory') return {
    title: 'Inventory', description: 'Keep product availability, pricing and supplier details up to date.', api: inventoryCrud,
    fields: inventoryFields(categories, vendors), filterKey: 'status',
    columns: [
      { key: 'name', label: 'Product' }, { key: 'sku', label: 'SKU' },
      { key: 'categoryId', label: 'Category', format: (value) => categories.find((item) => String(item.id) === String(value))?.name ?? '—' },
      { key: 'quantity', label: 'In stock' }, { key: 'sellingPrice', label: 'Price', format: formatMoney }, { key: 'status', label: 'Status' },
    ],
  }
  if (kind === 'vendors') return { title: 'Vendors', description: 'Manage supplier relationships and contact information.', api: vendorCrud, fields: vendorFields, columns: vendorColumns }
  if (kind === 'categories') return { title: 'Categories', description: 'Organize products so your catalog stays easy to navigate.', api: categoryCrud, fields: categoryFields, columns: categoryColumns, filterKey: 'status' }
  if (kind === 'orders') return {
    title: 'Orders', description: 'Review incoming orders and keep fulfillment moving.',
    api: { ...orderCrud, list: async () => (await orderApi.list()).map((order) => ({ ...order, vendorName: vendors.find((vendor) => String(vendor.id) === String(order.vendorId))?.name ?? 'Unassigned vendor' })) },
    fields: orderFields.map((field) => field.name === 'vendorId' ? { ...field, options: vendors.map((vendor) => ({ label: vendor.name, value: vendor.id })) } : field),
    columns: orderColumns, filterKey: 'status',
  }
  if (kind === 'sales') return { title: 'Sales', description: 'Browse completed sales and inventory movement.', api: saleCrud, fields: [], columns: saleColumns }
  return null
}

export function ManagementPage() {
  const { kind = '' } = useParams()
  const references = useReferenceData(kind === 'inventory')
  const config = useMemo(() => configFor(kind, references.categories, references.vendors), [kind, references.categories, references.vendors])
  if (!config) return <Alert severity="error">This management page was not found.</Alert>
  if (references.loading && (kind === 'inventory')) return <div className="flex min-h-64 items-center justify-center"><CircularProgress sx={{ color: '#246b4b' }} /></div>
  return <ResourcePage {...config} createPath={`/${kind}/new`} onChanged={() => { if (kind === 'inventory') window.dispatchEvent(new Event('inventory-updated')) }} />
}

function createConfig(kind: string, categories: Category[], vendors: Vendor[], inventory: InventoryItem[]) {
  if (kind === 'inventory') return { title: 'Add inventory', description: 'Add a product to your catalog and set its initial stock level.', api: inventoryCrud, fields: inventoryFields(categories, vendors), back: '/inventory' }
  if (kind === 'vendors') return { title: 'Create vendor', description: 'Add a supplier and the details your team needs to reach them.', api: vendorCrud, fields: vendorFields, back: '/vendors' }
  if (kind === 'categories') return { title: 'Create category', description: 'Create a category to keep your product catalog organized.', api: categoryCrud, fields: categoryFields, back: '/categories' }
  if (kind === 'orders') return { title: 'Create order', description: 'Record a vendor order and its current fulfillment status.', api: orderCrud, fields: orderFields.map((field) => field.name === 'vendorId' ? { ...field, options: vendors.map((vendor) => ({ label: vendor.name, value: vendor.id })) } : field), back: '/orders' }
  if (kind === 'sales') return { title: 'Create sale', description: 'Record a sale and automatically adjust available inventory.', api: saleCrud, fields: saleFields(inventory), back: '/sales' }
  return null
}

export function CreateRecordPage() {
  const { kind = '' } = useParams()
  const navigate = useNavigate()
  const references = useReferenceData(kind === 'inventory' || kind === 'sales')
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const config = useMemo(() => createConfig(kind, references.categories, references.vendors, references.inventory), [kind, references.categories, references.vendors, references.inventory])
  const initialValues = useMemo(() => ({ date: new Date().toISOString().slice(0, 10), status: kind === 'orders' ? 'Pending' : kind === 'inventory' ? 'Active' : kind === 'categories' ? 'Active' : '', quantity: kind === 'sales' ? 1 : '' }), [kind])

  async function submit(values: FormValues) {
    if (!config) return
    setSaving(true)
    try {
      const prepared = normalize(values, config.fields)
      if (kind === 'sales') {
        const product = references.inventory.find((item) => String(item.id) === String(prepared.productId))
        const quantity = Number(prepared.quantity)
        if (!product) throw new Error('Choose a valid inventory product.')
        if (quantity > product.quantity) throw new Error(`Only ${product.quantity} units of ${product.name} are currently available.`)
        const nextQuantity = product.quantity - quantity
        await inventoryApi.update(product.id, { quantity: nextQuantity, status: nextQuantity === 0 ? 'Inactive' : nextQuantity <= 10 ? 'Low stock' : 'Active' })
        try {
          await saleApi.create({ saleNumber: `SAL-${Date.now().toString().slice(-6)}`, productId: product.id, productName: product.name, customer: String(prepared.customer), quantity, unitPrice: product.sellingPrice, total: product.sellingPrice * quantity, date: String(prepared.date) })
        } catch (error) {
          await inventoryApi.update(product.id, { quantity: product.quantity, status: product.status })
          throw error
        }
      } else if (kind === 'orders') {
        await orderApi.create({ ...prepared, orderNumber: `ORD-${Date.now().toString().slice(-6)}` } as Omit<Order, 'id'>)
      } else {
        await config.api.create(prepared)
      }
      setNotice(`${config.title.replace(/^(Add|Create) /, '')} saved successfully.`)
      window.setTimeout(() => navigate(config.back), 650)
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Unable to save this record.') }
    finally { setSaving(false) }
  }

  if (!config) return <Alert severity="error">This form was not found.</Alert>
  if (references.loading && (kind === 'inventory' || kind === 'sales')) return <div className="flex min-h-64 items-center justify-center"><CircularProgress sx={{ color: '#246b4b' }} /></div>
  return <div className="mx-auto max-w-[1040px] space-y-6">
    <Breadcrumbs sx={{ fontSize: 12, color: 'var(--muted)' }}><Link to="/">Workspace</Link><Link to={config.back}>{config.back.split('/')[1]}</Link><span>{config.title}</span></Breadcrumbs>
    <div><p className="mb-1 text-xs font-bold uppercase tracking-[.14em] text-[#6c957b]">New record</p><h2 className="font-heading mb-1 text-2xl font-extrabold">{config.title}</h2><p className="m-0 text-sm text-[var(--muted)]">{config.description}</p></div>
    {references.error && <Alert severity="error">{references.error} Check that JSON Server is running.</Alert>}
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <Paper elevation={0} className="content-surface rounded-xl border border-[var(--line)] p-5 sm:p-7"><EntityForm fields={config.fields} initialValues={initialValues} submitLabel={kind === 'sales' ? 'Record sale' : kind === 'orders' ? 'Create order' : 'Save record'} loading={saving} onSubmit={submit} onCancel={() => navigate(config.back)} /></Paper>
      <Paper elevation={0} className="content-surface rounded-xl border border-[var(--line)] p-5"><div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-[#e8f3ec] text-[#246b4b]"><Inventory2Outlined /></div><h3 className="font-heading mb-2 text-sm font-extrabold">{kind === 'sales' ? 'Stock stays in sync' : 'A few things to know'}</h3><p className="mb-0 text-xs leading-5 text-[var(--muted)]">{kind === 'sales' ? 'The sale total is calculated from the product price. Available stock is checked and reduced automatically when the sale is recorded.' : kind === 'inventory' ? 'SKU and product name should be unique in your catalog. Products can be set inactive when they are no longer available.' : 'Fields marked as required need to be completed before this record can be saved.'}</p><div className="mt-5 flex items-start gap-2 rounded-lg bg-[#f4f8f4] p-3 text-[11px] leading-4 text-[#59725f]"><CheckCircleOutlineRounded sx={{ fontSize: 16, flex: '0 0 auto' }} />Changes are saved to your local mock API.</div></Paper>
    </div>
    <Snackbar open={Boolean(notice)} autoHideDuration={3600} onClose={() => setNotice('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert severity={notice.includes('successfully') ? 'success' : 'error'} variant="filled" onClose={() => setNotice('')}>{notice}</Alert></Snackbar>
    <Button startIcon={<ArrowBackRounded />} onClick={() => navigate(config.back)} sx={{ textTransform: 'none', color: 'var(--muted)' }}>Back to {config.back.slice(1)}</Button>
  </div>
}
