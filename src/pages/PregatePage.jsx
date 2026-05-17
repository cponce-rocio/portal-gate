import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'
import Loader from '../components/shared/Loader'
import StatCard from '../components/shared/StatCard'

// OK indicator component
const OkIndicator = ({ ok, label }) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold
                    border transition-all ${
                      ok
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
    {ok ? (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    )}
    {label}
  </div>
)

// Status row background
const rowStatus = (row) => {
  if (row.ok_pago && row.ok_autorizacion) return 'border-l-4 border-l-emerald-500'
  if (!row.ok_pago && !row.ok_autorizacion) return 'border-l-4 border-l-red-500'
  return 'border-l-4 border-l-amber-500'
}

export default function PregatePage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('todos')

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/pregate', {
        params: { search: search || undefined }
      })
      setRecords(data)
    } catch {
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  // Polling every 30 seconds for live updates
  useEffect(() => {
    const interval = setInterval(fetchRecords, 30000)
    return () => clearInterval(interval)
  }, [fetchRecords])

  // Apply filter
  const filtered = records.filter(r => {
    if (filter === 'completo')   return r.ok_pago && r.ok_autorizacion
    if (filter === 'incompleto') return !r.ok_pago || !r.ok_autorizacion
    if (filter === 'ok_pago')    return r.ok_pago
    if (filter === 'ok_auth')    return r.ok_autorizacion
    return true
  })

  const total     = records.length
  const completos = records.filter(r => r.ok_pago && r.ok_autorizacion).length
  const soloPago  = records.filter(r => r.ok_pago && !r.ok_autorizacion).length
  const soloAuth  = records.filter(r => !r.ok_pago && r.ok_autorizacion).length

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Info banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-sm text-slate-400">
          <span className="text-emerald-400 font-semibold">Módulo PreGate —</span>{' '}
          Vista de solo lectura. Los datos se actualizan automáticamente desde Facturación y Gaters.
          <span className="text-slate-500 ml-2 text-xs">Actualización cada 30 seg.</span>
        </div>
        <button
          onClick={fetchRecords}
          className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg
                     bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-400 transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total contenedores" value={total} color="text-port-cyan"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
        />
        <StatCard label="Habilitados" value={completos} color="text-emerald-400"
          sub="Pago + Autorización OK"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard label="Solo pago OK" value={soloPago} color="text-amber-400"
          sub="Falta autorización"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard label="Solo auth OK" value={soloAuth} color="text-blue-400"
          sub="Falta pago"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
        />
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-52 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="field pl-9"
            placeholder="Buscar por contenedor, booking, cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'todos',      label: 'Todos' },
            { key: 'completo',   label: '✓ Habilitados' },
            { key: 'ok_pago',    label: 'OK Pago' },
            { key: 'ok_auth',    label: 'OK Autorización' },
            { key: 'incompleto', label: 'Incompletos' },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all
                          ${filter === opt.key
                            ? 'bg-port-cyan/15 border-port-cyan/40 text-port-cyan'
                            : 'bg-transparent border-white/10 text-slate-400 hover:border-white/20'
                          }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? <Loader text="Cargando datos de PreGate..." /> : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No hay contenedores{search ? ' para esta búsqueda' : ''}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Contenedor</th>
                  <th>Booking</th>
                  <th>Cliente</th>
                  <th>Naviera</th>
                  <th>Factura</th>
                  <th>Importe</th>
                  <th className="text-center">OK Pago</th>
                  <th className="text-center">OK Autorización</th>
                  <th className="text-center">Estado General</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.key} className={rowStatus(row)}>
                    <td className="text-mono font-bold text-white">{row.contenedor || '—'}</td>
                    <td className="text-mono text-xs text-port-cyan">{row.booking || '—'}</td>
                    <td className="font-medium">{row.cliente || <span className="text-slate-600">Sin datos</span>}</td>
                    <td>{row.naviera || '—'}</td>
                    <td className="text-mono text-xs">{row.factura || '—'}</td>
                    <td className="text-amber-400 font-semibold">
                      {row.importe != null
                        ? `$${Number(row.importe).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                        : '—'}
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center">
                        <OkIndicator ok={row.ok_pago} label={row.ok_pago ? 'Pago' : 'Sin pago'} />
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center">
                        <OkIndicator
                          ok={row.ok_autorizacion}
                          label={row.ok_autorizacion ? 'Autorizado' : row.autorizacion_linea || 'Sin auth'}
                        />
                      </div>
                    </td>
                    <td className="text-center">
                      {row.ok_pago && row.ok_autorizacion ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                         bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          HABILITADO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                         bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          PENDIENTE
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-white/5 text-xs text-slate-500 flex justify-between">
            <span>{filtered.length} de {records.length} registro{records.length !== 1 ? 's' : ''}</span>
            <span className="text-emerald-400">
              {completos} habilitado{completos !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-6 rounded-sm bg-emerald-500" />
          <span>Pago + Autorización OK → Habilitado para operar</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-6 rounded-sm bg-amber-500" />
          <span>Uno o ambos pendientes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-6 rounded-sm bg-red-500" />
          <span>Sin pago y sin autorización</span>
        </div>
      </div>
    </div>
  )
}
