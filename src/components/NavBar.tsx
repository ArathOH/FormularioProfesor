import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { isAdmin } from '../lib/role'
import LogoUABC from '../assets/LogoUABC.png'

/** Utilidades de estilo */
const cls = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(' ')

const navItemsAuth: { to: string; label: string; adminOnly?: boolean }[] = [
  { to: '/', label: 'Home' },
  { to: '/profile', label: 'Mi Información' },
  { to: '/certificates', label: 'Certificados' },
  { to: '/reports', label: 'Reportes' },
  { to: '/admin', label: 'Admin', adminOnly: true },
]

const navItemsAnon: { to: string; label: string }[] = [
  { to: '/', label: 'Home' },
]

function Avatar({ name, photoURL }: { name?: string | null; photoURL?: string | null }) {
  if (photoURL) {
    return <img src={photoURL} alt="Avatar" className="h-9 w-9 rounded-full object-cover" />
  }
  const initials = (name || 'U').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase()
  return (
    <div className="h-9 w-9 rounded-full grid place-items-center bg-[var(--uabc-green)] text-white text-sm font-semibold">
      {initials}
    </div>
  )
}

export default function NavBar(){
  const { user, userRole, loading, logout } = useAuth()
  const loc = useLocation()
  const [open, setOpen] = useState(false)         // menú móvil
  const [userOpen, setUserOpen] = useState(false) // dropdown usuario
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  // sombra y fondo al hacer scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // cerrar menús en navegación o clic fuera / Esc
  useEffect(() => { setOpen(false); setUserOpen(false) }, [loc.pathname])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape'){ setOpen(false); setUserOpen(false) } }
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick) }
  }, [])

  const baseLink = 'px-3 py-2 rounded-lg text-sm font-medium transition-colors'
  const activeLink = 'text-[var(--uabc-green)] underline decoration-[var(--uabc-ochre)] underline-offset-4'
  const inactiveLink = 'text-slate-600 hover:text-[var(--uabc-ochre)] '

  const items = user 
    ? navItemsAuth.filter(item => !item.adminOnly || isAdmin(userRole || undefined))
    : navItemsAnon

  return (
    <header className={cls(
      'sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80  border-b',
      scrolled && 'shadow-sm'
    )}>
      {/* Skip link accesible */}
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-[var(--uabc-ochre)] text-white rounded px-3 py-1">Saltar al contenido</a>

      <nav className="max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Branding + Desktop links */}
          <div className="flex items-center gap-1">
            <Link to="/" className="flex items-center gap-2">
              <img src={LogoUABC} alt="UABC" className="h-10 w-auto" />
              <span className="sr-only">Inicio</span>
            </Link>

            <div className="hidden md:flex items-center gap-1 ml-2">
              {items.map(({to, label}) => (
                <NavLink key={to} to={to}
                  className={({isActive}) => cls(baseLink, isActive ? activeLink : inactiveLink)}>
                  {label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="h-9 w-24 rounded-lg bg-slate-200 animate-pulse" aria-hidden="true" />
            ) : user ? (
              // User dropdown
              <div className="relative" ref={userRef}>
                <button
                  onClick={()=>setUserOpen(v=>!v)}
                  className="flex items-center gap-2 rounded-xl px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[var(--uabc-ochre)]"
                  aria-haspopup="menu"
                  aria-expanded={userOpen}
                >
                  <Avatar name={user.displayName} photoURL={user.photoURL} />
                  <span className="hidden sm:block max-w-[12ch] truncate text-sm text-slate-700">{user.displayName || user.email}</span>
                  <svg className={cls('h-4 w-4 transition-transform', userOpen && 'rotate-180')} viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"/></svg>
                </button>
                {userOpen && (
                  <div role="menu" className="absolute right-0 mt-2 w-56 rounded-xl border bg-white shadow-md p-1">
                    <Link to="/profile" role="menuitem" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50">Mi Perfil</Link>
                    <button onClick={logout} role="menuitem" className="w-full text-left rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50">Salir</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="inline-flex items-center rounded-xl bg-[var(--uabc-green)] px-4 py-2 text-white hover:bg-[var(--uabc-ochre)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--uabc-ochre)]">Entrar</Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden inline-flex items-center justify-center rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--uabc-ochre)]"
              aria-label="Abrir menú"
              aria-controls="mobile-menu"
              aria-expanded={open}
              onClick={()=>setOpen(v=>!v)}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div ref={menuRef} id="mobile-menu" className={cls('md:hidden overflow-hidden transition-[max-height] duration-300', open ? 'max-h-96' : 'max-h-0')}>
          <div className="border-t py-2 space-y-1">
            {items.map(({to, label}) => (
              <NavLink key={to} to={to} className={({isActive}) => cls('block rounded-lg px-3 py-2 text-sm', isActive ? activeLink : 'text-slate-700 hover:bg-slate-50')}>{label}</NavLink>
            ))}
            {!loading && !user && (
              <Link to="/login" className="block rounded-lg px-3 py-2 text-sm bg-[var(--uabc-green)] text-white hover:bg-[var(--uabc-ochre)]">Entrar</Link>
            )}
            {user && (
              <button onClick={logout} className="block w-full text-left rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50">Salir</button>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}