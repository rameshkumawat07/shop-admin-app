import { useEffect, useState } from 'react'
import {
  ArrowDownwardRounded, ArrowUpwardRounded, Inventory2Outlined, LocalMallOutlined,
  PointOfSaleOutlined, StorefrontOutlined, CategoryOutlined, MoreHorizRounded,
} from '@mui/icons-material'
import { Alert, Avatar, CircularProgress, Paper, TablePagination } from '@mui/material'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { inventoryApi } from '../api/inventoryApi'
import { orderApi } from '../api/orderApi'
import { saleApi } from '../api/saleApi'
import { vendorApi } from '../api/vendorApi'
import { categoryApi } from '../api/categoryApi'
import type { Category, InventoryItem, Order, Sale, Vendor } from '../api/types'
import { formatCompactMoney, formatMoney } from '../utils/format'

const weeklySales = [
  { day: 'Mon', sales: 1850 }, { day: 'Tue', sales: 2380 }, { day: 'Wed', sales: 1960 },
  { day: 'Thu', sales: 3150 }, { day: 'Fri', sales: 2870 }, { day: 'Sat', sales: 4020 }, { day: 'Sun', sales: 3480 },
]
const cards = [
  { key: 'products', label: 'Total products', icon: Inventory2Outlined, tint: '#e8f3ec', color: '#246b4b', delta: '+8.2%', positive: true },
  { key: 'orders', label: 'Total orders', icon: LocalMallOutlined, tint: '#edf1f8', color: '#5776a9', delta: '+12.4%', positive: true },
  { key: 'sales', label: 'Total sales', icon: PointOfSaleOutlined, tint: '#fbf1e4', color: '#b27831', delta: '+6.1%', positive: true },
  { key: 'vendors', label: 'Total vendors', icon: StorefrontOutlined, tint: '#f3ebf3', color: '#875f86', delta: '+2 this month', positive: true },
  { key: 'categories', label: 'Categories', icon: CategoryOutlined, tint: '#eaf0ef', color: '#57817a', delta: 'Across catalog', positive: true },
]

export function Dashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [orders, setOrders] = useState<Order[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [ordersPage, setOrdersPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([inventoryApi.list(), orderApi.list(), saleApi.list(), vendorApi.list(), categoryApi.list()])
      .then(([items, orderRows, saleRows, vendors, categories]) => {
        setInventory(items as InventoryItem[])
        setOrders(orderRows as Order[])
        setVendors(vendors as Vendor[])
        setCounts({ products: items.length, orders: orderRows.length, sales: saleRows.reduce((sum, sale) => sum + (sale as Sale).total, 0), vendors: (vendors as Vendor[]).length, categories: (categories as Category[]).length })
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Could not connect to the inventory API.'))
      .finally(() => setLoading(false))
  }, [])

  const sortedOrders = [...orders].sort((a, b) => b.date.localeCompare(a.date))
  const visibleOrdersPage = Math.min(ordersPage, Math.max(0, Math.ceil(sortedOrders.length / 10) - 1))
  const latestOrders = sortedOrders.slice(visibleOrdersPage * 10, visibleOrdersPage * 10 + 10)
  const lowStock = inventory.filter((item) => item.quantity < 15).slice(0, 4)

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><CircularProgress sx={{ color: '#246b4b' }} /></div>
  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="mb-1 text-xs font-bold uppercase tracking-[.14em] text-[#6c957b]">Saturday, October 3</p><h2 className="font-heading mb-1 text-2xl font-extrabold">Good morning, Olivia <span aria-hidden="true">✳</span></h2><p className="m-0 text-sm text-[var(--muted)]">Here’s what’s happening across your store today.</p></div><div className="text-xs text-[var(--muted)]">Store overview <span className="mx-1">/</span> Last 7 days</div></div>
    {error && <Alert severity="error">{error} Start the mock API with <code>npm run server</code>.</Alert>}
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(({ key, label, icon: Icon, tint, color, delta, positive }) => <Paper key={key} elevation={0} className="content-surface rounded-xl border border-[var(--line)] p-4 transition-transform hover:-translate-y-0.5 sm:p-5">
        <div className="flex items-center justify-between"><span className="text-xs font-semibold text-[var(--muted)]">{label}</span><Avatar variant="rounded" sx={{ width: 34, height: 34, bgcolor: tint, color, borderRadius: 2 }}><Icon sx={{ fontSize: 18 }} /></Avatar></div>
        <div className="mt-5 flex items-end justify-between"><span className="font-heading text-[27px] font-extrabold leading-none">{key === 'sales' ? formatMoney(counts[key] ?? 0) : (counts[key] ?? 0).toLocaleString()}</span><span className={`flex items-center text-[10px] font-bold ${positive ? 'text-[#38805a]' : 'text-[#a45050]'}`}>{positive ? <ArrowUpwardRounded sx={{ fontSize: 13 }} /> : <ArrowDownwardRounded sx={{ fontSize: 13 }} />}{delta}</span></div>
      </Paper>)}
    </div>
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.65fr_1fr]">
      <Paper elevation={0} className="content-surface overflow-hidden rounded-xl border border-[var(--line)]">
        <div className="flex items-center justify-between p-5 pb-1"><div><h3 className="m-0 text-sm font-bold">Sales overview</h3><p className="mb-0 mt-1 text-xs text-[var(--muted)]">A steady week, with Saturday leading the way</p></div><button className="rounded-md p-1 text-[var(--muted)] hover:bg-[var(--canvas)]" aria-label="More sales options"><MoreHorizRounded /></button></div>
        <div className="mt-2 h-[270px] w-full pr-4"><ResponsiveContainer width="100%" height="100%"><AreaChart data={weeklySales} margin={{ top: 12, right: 4, left: 2, bottom: 0 }}><defs><linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4c9a6b" stopOpacity={0.2} /><stop offset="95%" stopColor="#4c9a6b" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="var(--line)" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#89938b', fontSize: 11 }} dy={10} /><YAxis tickLine={false} axisLine={false} tick={{ fill: '#89938b', fontSize: 10 }} tickFormatter={formatCompactMoney} width={38} /><Tooltip formatter={(value) => [formatMoney(Number(value)), 'Sales']} contentStyle={{ border: '1px solid var(--line)', borderRadius: 10, fontSize: 12, background: 'var(--surface)' }} /><Area type="monotone" dataKey="sales" stroke="#38805a" strokeWidth={2.5} fill="url(#salesFill)" activeDot={{ r: 5, fill: '#38805a', stroke: '#fff', strokeWidth: 2 }} /></AreaChart></ResponsiveContainer></div>
      </Paper>
      <Paper elevation={0} className="content-surface overflow-hidden rounded-xl border border-[var(--line)]">
        <div className="flex items-center justify-between border-b border-[var(--line)] p-5"><div><h3 className="m-0 text-sm font-bold">Stock watch</h3><p className="mb-0 mt-1 text-xs text-[var(--muted)]">Products that need attention</p></div><span className="rounded-full bg-[#fbf1e4] px-2.5 py-1 text-[10px] font-bold text-[#a57432]">{lowStock.length} items</span></div>
        <div className="divide-y divide-[var(--line)]">{lowStock.length ? lowStock.map((item) => <div key={item.id} className="flex items-center gap-3 px-5 py-4"><Avatar variant="rounded" sx={{ width: 37, height: 37, bgcolor: '#f4f1e8', color: '#917a48', fontSize: 12, fontWeight: 800 }}>{item.name.slice(0, 1)}</Avatar><span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold">{item.name}</span><span className="mt-0.5 block text-[10px] text-[var(--muted)]">{item.sku}</span></span><span className={`text-xs font-bold ${item.quantity === 0 ? 'text-[#bf5650]' : 'text-[#b27831]'}`}>{item.quantity} left</span></div>) : <p className="p-6 text-sm text-[var(--muted)]">All stock levels look healthy.</p>}</div>
      </Paper>
    </div>
    <Paper elevation={0} className="content-surface overflow-hidden rounded-xl border border-[var(--line)]">
      <div className="flex items-center justify-between border-b border-[var(--line)] p-5"><div><h3 className="m-0 text-sm font-bold">Recent orders</h3><p className="mb-0 mt-1 text-xs text-[var(--muted)]">A quick look at the latest activity</p></div><a href="/orders" className="text-xs font-bold text-[#34714e] hover:underline">View all orders <span aria-hidden="true">→</span></a></div>
      <table className="recent-orders-table w-full table-fixed text-left"><thead><tr className="bg-[#f8faf8] text-[10px] font-bold uppercase tracking-[.1em] text-[#758078]"><th className="w-[25%] px-2 py-3 sm:px-5">Order</th><th className="w-[35%] px-2 py-3 sm:px-5">Vendor</th><th className="hide-small w-[15%] px-5 py-3">Date</th><th className="hide-small w-[15%] px-5 py-3">Status</th><th className="w-[25%] px-2 py-3 text-right sm:px-5">Total</th></tr></thead><tbody className="divide-y divide-[var(--line)]">{latestOrders.map((order) => <tr key={order.id} className="text-xs"><td className="break-words px-2 py-3.5 font-bold sm:px-5">{order.orderNumber}</td><td className="break-words px-2 py-3.5 sm:px-5">{vendors.find((vendor) => String(vendor.id) === String(order.vendorId))?.name ?? 'Unassigned vendor'}</td><td className="hide-small px-5 py-3.5 text-[var(--muted)]">{new Date(`${order.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td><td className="hide-small px-5 py-3.5"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${order.status === 'Delivered' ? 'bg-[#e8f3ec] text-[#34714e]' : order.status === 'Pending' ? 'bg-[#fbf1e4] text-[#a57432]' : 'bg-[#edf1f8] text-[#5776a9]'}`}>{order.status}</span></td><td className="break-words px-2 py-3.5 text-right font-semibold sm:px-5">{formatMoney(order.total)}</td></tr>)}</tbody></table>
      {!!sortedOrders.length && <TablePagination component="div" count={sortedOrders.length} page={visibleOrdersPage} onPageChange={(_, nextPage) => setOrdersPage(nextPage)} rowsPerPage={10} rowsPerPageOptions={[10]} sx={{ borderTop: '1px solid var(--line)', color: 'var(--muted)', '& .MuiTablePagination-toolbar': { minHeight: 52, px: { xs: 1, sm: 2 } }, '& .MuiTablePagination-displayedRows': { fontSize: 11 } }} />}
      {!latestOrders.length && <p className="p-5 text-sm text-[var(--muted)]">No orders have been placed yet.</p>}
    </Paper>
  </div>
}
