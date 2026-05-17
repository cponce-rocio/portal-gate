import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import bgPort from '../assets/bg-port.jpg'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const login    = useAuthStore(s => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) {
      toast.error('Ingresá usuario y contraseña')
      return
    }
    setLoading(true)
    try {
      const user = await login(username, password)
      toast.success(`Bienvenido, ${user.username}`)
      const routes = { facturacion: '/facturacion', gaters: '/gaters', pregate: '/pregate' }
      navigate(routes[user.role] || '/')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgPort})` }}
      />
      {/* Dark overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-port-dark/95 via-port-navy/85 to-port-dark/90" />

      {/* Animated grid lines */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,194,224,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,194,224,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-port-blue/20 border border-port-cyan/30 mb-4 mx-auto">
            <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
              <rect x="4" y="18" width="8" height="14" rx="1" fill="#00c2e0" opacity=".9"/>
              <rect x="14" y="12" width="8" height="20" rx="1" fill="#1e4d8c" opacity=".9"/>
              <rect x="24" y="18" width="8" height="14" rx="1" fill="#00c2e0" opacity=".7"/>
              <rect x="34" y="8" width="8" height="24" rx="1" fill="#1e4d8c" opacity=".8"/>
              <line x1="4" y1="36" x2="44" y2="36" stroke="#00c2e0" strokeWidth="2" strokeLinecap="round"/>
              <path d="M2 40 L24 44 L46 40" stroke="#1e4d8c" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-display text-5xl font-bold tracking-wider text-white">
            PORT<span className="text-port-cyan">GATE</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 tracking-widest uppercase">
            Sistema de Control Logístico
          </p>
        </div>

        {/* Form card */}
        <div className="glass-card p-8 shadow-2xl shadow-black/50">
          <h2 className="text-lg font-semibold text-white mb-6">Iniciar Sesión</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="field-label">Usuario</label>
              <input
                type="text"
                className="field"
                placeholder="Ingresá tu usuario"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="field-label">Contraseña</label>
              <input
                type="password"
                className="field"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-port-blue hover:bg-port-cyan/20
                         border border-port-cyan/40 text-white font-semibold
                         transition-all duration-200 flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              )}
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-xs text-slate-500 text-center mb-3 uppercase tracking-wider">Accesos de prueba</p>
            <div className="grid grid-cols-3 gap-2">
              {['facturacion', 'gaters', 'pregate'].map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => { setUsername(role); setPassword('1234') }}
                  className="py-2 px-2 rounded-lg bg-port-navy/60 border border-white/5 hover:border-port-cyan/30
                             text-xs text-slate-400 hover:text-port-cyan transition-all capitalize text-center"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
