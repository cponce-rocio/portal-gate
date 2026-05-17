import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'
import bgPort from '../../assets/bg-port.jpg'

const roleConfig = {
  facturacion: {
    label: 'Facturación',
    color: 'text-amber-400',
    accent: 'border-amber-400/40',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    path: '/facturacion',
  },
  gaters: {
    label: 'Gaters',
    color: 'text-port-cyan',
    accent: 'border-port-cyan/40',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    path: '/gaters',
  },
  pregate: {
    label: 'PreGate',
    color: 'text-emerald-400',
    accent: 'border-emerald-400/40',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    path: '/pregate',
  },
}

export default function DashboardLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const config = roleConfig[user?.role] || {}
  
  // Estado para controlar el menú desplegable en celulares
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Cierra automáticamente el menú móvil cuando el usuario cambia de página
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  const handleLogout = () => {
    logout()
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex relative overflow-x-hidden">
      {/* Subtle background */}
      <div className="fixed inset-0 bg-port-dark" />
      <div
        className="fixed inset-0 bg-cover bg-center opacity-5"
        style={{ backgroundImage: `url(${bgPort})` }}
      />

      {/* Oscurecedor de pantalla de fondo (Overlay) cuando el menú móvil está abierto */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Ahora se oculta en móviles y se despliega con animación */}
      <aside className={`fixed left-0 top-0 h-full w-64 z-40 flex flex-col
                         bg-port-navy/95 backdrop-blur-md border-r border-white/5
                         transition-transform duration-300 ease-in-out
                         ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
                         md:translate-x-0`}>
        {/* Brand */}
        <div className="px-6 py-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-port-blue/30 border border-port-cyan/30
                            flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
                <rect x="2" y="12" width="5" height="9" rx="0.5" fill="#00c2e0" opacity=".9"/>
                <rect x="9" y="8" width="5" height="13" rx="0.5" fill="#1e4d8c"/>
                <rect x="16" y="12" width="5" height="9" rx="0.5" fill="#00c2e0" opacity=".7"/>
                <rect x="23" y="5" width="5" height="16" rx="0.5" fill="#1e4d8c" opacity=".8"/>
                <line x1="2" y1="24" x2="30" y2="24" stroke="#00c2e0" strokeWidth="1.5"/>
              </svg>
            </div>
            <div>
              <div className="text-display text-xl font-bold tracking-wider text-white">
                PORT<span className="text-port-cyan">GATE</span>
              </div>
              <div className="text-xs text-slate-500 -mt-0.5">Control Logístico</div>
            </div>
          </div>

          {/* Botón para cerrar menú (Solo visible en celular dentro del menú) */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-white/5">
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl
                           bg-port-steel/40 border ${config.accent}`}>
            <div className={`w-8 h-8 rounded-lg bg-port-steel/80 border ${config.accent}
                             flex items-center justify-center ${config.color}`}>
              {config.icon}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white capitalize truncate">{user?.username}</div>
              <div className={`text-xs font-medium ${config.color}`}>{config.label}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          <p className="text-xs text-slate-600 uppercase tracking-widest px-3 mb-3">Módulo</p>
          <NavLink
            to={config.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            {config.icon}
            <span>{config.label}</span>
          </NavLink>
        </nav>

        {/* Bottom actions */}
        <div className="px-4 pb-6 pt-2 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content — Ajustado de 'ml-64' a 'md:ml-64' para remover margen rígido en celular */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen min-w-0 z-10">
        {/* Top navbar */}
        <header className="sticky top-0 z-20 h-16 flex items-center px-4 md:px-6 gap-4
                           bg-port-dark/80 backdrop-blur-md border-b border-white/5">
          
          {/* Botón de hamburguesa para celular */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-xl bg-port-navy/50 border border-white/10 text-white hover:bg-port-navy"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className={`text-display text-xl md:text-2xl font-bold tracking-wide ${config.color} truncate`}>
              {config.label}
            </h1>
            <p className="text-[10px] md:text-xs text-slate-500 -mt-0.5 truncate">
              {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Live indicator — Se achica ligeramente en celular para que no estorbe */}
          <div className="flex items-center gap-1.5 md:gap-2 px-2.5 py-1 md:py-1.5 rounded-full
                          bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
            <span className="text-[10px] md:text-xs text-emerald-400 font-medium">Activo</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 relative min-w-0">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}