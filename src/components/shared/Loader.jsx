export default function Loader({ text = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-2 border-port-cyan/20 rounded-full" />
        <div className="absolute inset-0 border-2 border-transparent border-t-port-cyan rounded-full animate-spin" />
      </div>
      <span className="text-sm text-slate-500">{text}</span>
    </div>
  )
}
