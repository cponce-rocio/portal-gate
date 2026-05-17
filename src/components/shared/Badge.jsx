const configs = {
  pago:       { cls: 'badge-pago',       label: 'Pago',       dot: 'bg-emerald-400' },
  no_pago:    { cls: 'badge-no_pago',    label: 'No Pago',    dot: 'bg-red-400' },
  pendiente:  { cls: 'badge-pendiente',  label: 'Pendiente',  dot: 'bg-amber-400' },
  autorizado: { cls: 'badge-autorizado', label: 'Autorizado', dot: 'bg-emerald-400' },
  rechazado:  { cls: 'badge-rechazado',  label: 'Rechazado',  dot: 'bg-red-400' },
}

export default function Badge({ status }) {
  const cfg = configs[status] || configs.pendiente
  return (
    <span className={cfg.cls}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}
