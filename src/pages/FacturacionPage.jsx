import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'
import Loader from '../components/shared/Loader'
import Modal from '../components/shared/Modal'
import Badge from '../components/shared/Badge'
import StatCard from '../components/shared/StatCard'

const EMPTY_FORM = {
  cliente: '', factura: '', booking: '', contenedor: '',
  naviera: '', cantidad: '', importe: '', estado_pago: 'Autorizo Maritima', observacion: ''
}

export default function FacturacionPage() {
  const [records, setRecords]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [estadoFilter, setEstado] = useState('todos')
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEdit]     = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState(null)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/facturacion', {
        params: { search: search || undefined, estado: estadoFilter !== 'todos' ? estadoFilter : undefined }
      })
      setRecords(data)
    } catch {
      toast.error('Error al cargar registros')
    } finally {
      setLoading(false)
    }
  }, [search, estadoFilter])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const openCreate = () => { setEdit(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit   = (r)  => { setEdit(r); setForm({ ...r }); setModalOpen(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    const required = ['cliente','factura','booking','contenedor','naviera','cantidad','importe']
    for (const k of required) {
      if (!form[k]?.toString().trim()) {
        toast.error(`El campo "${k}" es obligatorio`)
        return
      }
    }
    setSaving(true)
    try {
      if (editRecord) {
        await api.put(`/facturacion/${editRecord.id}`, form)
        toast.success('Registro actualizado')
      } else {
        await api.post('/facturacion', form)
        toast.success('Registro creado')
      }
      setModalOpen(false)
      fetchRecords()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Confirmar eliminación?')) return
    setDeleting(id)
    try {
      await api.delete(`/facturacion/${id}`)
      toast.success('Registro eliminado')
      fetchRecords()
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setDeleting(null)
    }
  }

  const handleExport = async () => {
    try {
      const res = await api.get('/export/facturacion', { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `facturacion_${new Date().toISOString().slice(0,10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Excel exportado correctamente')
    } catch {
      toast.error('Error al exportar')
    }
  }

  const field = (k, v = '') => setForm(f => ({ ...f, [k]: v }))

  // Stats
  const total   = records.length
  const pagos   = records.filter(r => r.estado_pago === 'pago').length
  const noPagos = records.filter(r => r.estado_pago === 'no_pago').length
// CAMBIO 1: Sumar (importe * cantidad) para la tarjeta global
  const importe = records.reduce((s, r) => s + ((Number(r.importe) || 0) * (Number(r.cantidad) || 0)), 0)
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total registros" value={total} color="text-amber-400"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <StatCard label="Pagos" value={pagos} color="text-emerald-400"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard label="No Pagos" value={noPagos} color="text-red-400"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard label="Importe total" value={`$${importe.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} color="text-port-cyan"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Toolbar */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-52 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="field pl-9"
            placeholder="Buscar por cliente, factura, booking, contenedor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="field w-40"
          value={estadoFilter}
          onChange={e => setEstado(e.target.value)}
        >
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Autorizo Maritima</option>
          <option value="pago">Pago</option>
          <option value="no_pago">No Pago</option>
        </select>

        <button onClick={handleExport} className="btn-ghost">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar Excel
        </button>

        <button onClick={openCreate} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Registro
        </button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? <Loader /> : records.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No hay registros{search ? ' para esta búsqueda' : ''}</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>Cliente</th><th>Factura</th><th>Booking</th>
                  <th>Contenedor</th><th>Naviera</th><th>Cant.</th>
                  <th>Importe</th><th>Estado</th><th>Observación</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td className="text-mono text-xs text-slate-500">#{r.id}</td>
                    <td className="font-medium text-white">{r.cliente}</td>
                    <td className="text-mono text-xs">{r.factura}</td>
                    <td className="text-mono text-xs text-port-cyan">{r.booking}</td>
                    <td className="text-mono text-xs">{r.contenedor}</td>
                    <td>{r.naviera}</td>
                    <td className="text-center">{r.cantidad}</td>
                    <td className="text-right font-semibold text-amber-400">
                      ${Number(r.importe).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td><Badge status={r.estado_pago} /></td>
                    <td className="max-w-32 truncate text-slate-400 text-xs">{r.observacion || '—'}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(r)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-port-cyan hover:bg-port-cyan/10 transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={deleting === r.id}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {!loading && records.length > 0 && (
          <div className="px-4 py-3 border-t border-white/5 text-xs text-slate-500">
            {records.length} registro{records.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editRecord ? 'Editar Registro' : 'Nuevo Registro de Facturación'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="field-label">Cliente *</label>
              <input className="field" placeholder="Nombre del cliente" value={form.cliente} onChange={e => field('cliente', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Factura *</label>
              <input className="field" placeholder="Nº Factura" value={form.factura} onChange={e => field('factura', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Booking *</label>
              <input className="field" placeholder="Nº Booking" value={form.booking} onChange={e => field('booking', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Contenedor *</label>
              <input className="field" placeholder="ID Contenedor" value={form.contenedor} onChange={e => field('contenedor', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Naviera *</label>
              <input className="field" placeholder="Naviera" value={form.naviera} onChange={e => field('naviera', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Cantidad *</label>
              <input type="number" className="field" placeholder="0" value={form.cantidad} onChange={e => field('cantidad', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Importe *</label>
              <input type="number" step="0.01" className="field" placeholder="0.00" value={form.importe} onChange={e => field('importe', e.target.value)} />
            </div>
            <div>
              <label className="field-label">Estado de Pago *</label>
              <select className="field" value={form.estado_pago} onChange={e => field('estado_pago', e.target.value)}>
                <option value="pendiente">Autorizo Maritima</option>
                <option value="pago">Pago</option>
                <option value="no_pago">No Pago</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="field-label">Observación</label>
              <textarea className="field resize-none" rows={3} placeholder="Observaciones adicionales..." value={form.observacion} onChange={e => field('observacion', e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Guardando...' : editRecord ? 'Actualizar' : 'Crear Registro'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
