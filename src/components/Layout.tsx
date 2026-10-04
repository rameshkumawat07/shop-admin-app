import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  AccountCircleOutlined, AddBoxOutlined, CategoryOutlined,
  ChevronRight, DarkModeOutlined, DashboardOutlined, Inventory2Outlined,
  LogoutOutlined, MenuRounded, PointOfSaleOutlined,
  SearchRounded, ShoppingBagOutlined, StorefrontOutlined, WbSunnyOutlined, CloseRounded,
} from '@mui/icons-material'
import { Avatar, IconButton, Tooltip } from '@mui/material'

const groups = [
  { label: 'Workspace', items: [{ label: 'Dashboard', path: '/', icon: DashboardOutlined }] },
  { label: 'Catalog', items: [
    { label: 'Inventory list', path: '/inventory', icon: Inventory2Outlined },
    { label: 'Add inventory', path: '/inventory/new', icon: AddBoxOutlined },
    { label: 'Categories', path: '/categories', icon: CategoryOutlined },
    { label: 'Add category', path: '/categories/new', icon: AddBoxOutlined },
    { label: 'Vendors', path: '/vendors', icon: StorefrontOutlined },
    { label: 'Add vendor', path: '/vendors/new', icon: AddBoxOutlined },
  ] },
  { label: 'Operations', items: [
    { label: 'Orders', path: '/orders', icon: ShoppingBagOutlined },
    { label: 'Create order', path: '/orders/new', icon: AddBoxOutlined },
    { label: 'Sales', path: '/sales', icon: PointOfSaleOutlined },
    { label: 'Create sale', path: '/sales/new', icon: AddBoxOutlined },
  ] },
]

function Sidebar({ dark, toggleTheme, open, close }: { dark: boolean; toggleTheme: () => void; open: boolean; close: () => void }) {
  return <>
    {open && <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={close} />}
    <aside className={`sidebar fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[var(--line)] bg-white px-4 py-5 transition-transform duration-200 lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="mb-8 flex items-center justify-between px-2">
        <NavLink to="/" onClick={close} className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#246b4b] text-white"><StorefrontOutlined /></span>
          <span><span className="font-heading block text-[17px] font-extrabold leading-5">Stockroom</span><span className="text-[11px] font-semibold uppercase tracking-[.12em] text-[var(--muted)]">Admin console</span></span>
        </NavLink>
        <IconButton size="small" onClick={close} className="lg:!hidden" aria-label="Close navigation"><CloseRounded fontSize="small" /></IconButton>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto">
        {groups.map((group) => <section key={group.label}>
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-[var(--muted)]">{group.label}</p>
          <div className="space-y-1">{group.items.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} end={path === '/'} onClick={close} className={({ isActive }) => `sidebar-link flex min-h-10 items-center gap-3 rounded-lg px-3 text-[13px] font-semibold transition-colors ${isActive ? 'active bg-[#e8f3ec] text-[#246b4b]' : 'text-[#737c74] hover:bg-[#f4f7f4] hover:text-[#202720]'}`}>
            <Icon sx={{ fontSize: 19 }} /><span>{label}</span>{path === '/inventory' && <span className="ml-auto rounded-full bg-[#edf1ed] px-2 py-0.5 text-[10px]">5</span>}
          </NavLink>)}</div>
        </section>)}
      </nav>
      <div className="mt-4 border-t border-[var(--line)] pt-4">
        <button onClick={toggleTheme} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[13px] font-semibold text-[var(--muted)] transition hover:bg-[#f4f7f4] hover:text-[var(--ink)]">
          {dark ? <WbSunnyOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
          <span>{dark ? 'Switch to light mode' : 'Switch to dark mode'}</span>
        </button>
        <div className="mt-3 flex items-center gap-3 rounded-xl bg-[#f7f9f7] p-3">
          <Avatar sx={{ width: 34, height: 34, bgcolor: '#dcece1', color: '#246b4b', fontSize: 13, fontWeight: 700 }}>OM</Avatar>
          <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold">Olivia Martin</span><span className="block text-[10px] text-[var(--muted)]">Administrator</span></span>
          <Tooltip title="Account"><AccountCircleOutlined sx={{ fontSize: 18, color: '#929b93' }} /></Tooltip>
        </div>
      </div>
    </aside>
  </>
}

export function AppLayout({ dark, toggleTheme, onLogout }: { dark: boolean; toggleTheme: () => void; onLogout: () => void }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const allItems = groups.flatMap((group) => group.items)
  const pageTitle = allItems.find((item) => item.path === location.pathname)?.label ?? 'Dashboard'

  return <div className={`app-shell ${dark ? 'dark' : ''} flex min-h-screen`}>
    <Sidebar dark={dark} toggleTheme={toggleTheme} open={open} close={() => setOpen(false)} />
    <div className="main-area flex min-h-screen flex-1 flex-col">
      <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[var(--line)] bg-[var(--surface)] px-4 sm:px-7">
        <div className="flex items-center gap-3">
          <IconButton aria-label="Open navigation" onClick={() => setOpen(true)} className="lg:!hidden"><MenuRounded /></IconButton>
          <div><div className="mb-0.5 flex items-center gap-2 text-[11px] text-[var(--muted)]"><span>Workspace</span><ChevronRight sx={{ fontSize: 13 }} /><span className="text-[var(--ink)]">{pageTitle}</span></div><h1 className="font-heading m-0 text-lg font-extrabold leading-5">{pageTitle}</h1></div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <IconButton aria-label="Search inventory" onClick={() => navigate('/inventory')} sx={{ color: 'var(--muted)' }}><SearchRounded /></IconButton>
          <span className="hidden h-8 border-l border-[var(--line)] sm:block" />
          <div className="hidden items-center gap-2 sm:flex"><Avatar sx={{ width: 34, height: 34, bgcolor: '#dcece1', color: '#246b4b', fontSize: 12, fontWeight: 700 }}>OM</Avatar><span className="text-left"><span className="block text-xs font-bold">Olivia Martin</span><span className="block text-[10px] text-[var(--muted)]">Admin</span></span></div>
          <Tooltip title="Log out"><IconButton aria-label="Log out" onClick={onLogout} sx={{ color: 'var(--muted)' }}><LogoutOutlined /></IconButton></Tooltip>
        </div>
      </header>
      <main className="w-full flex-1 p-4 sm:p-6 lg:p-8"><div className="page-enter mx-auto w-full max-w-[1500px]"><Outlet /></div></main>
      <footer className="border-t border-[var(--line)] px-6 py-4 text-center text-[10px] text-[var(--muted)]">Stockroom inventory operations <span className="mx-1">·</span> Updated just now</footer>
    </div>
  </div>
}
