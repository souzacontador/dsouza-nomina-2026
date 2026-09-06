import { AlertTriangle, Info, XCircle } from 'lucide-react';
import type { Aviso } from '../../motor/tipos';

export default function Avisos({ avisos }: { avisos: Aviso[] }) {
  if (avisos.length === 0) return null;
  const estilo = {
    error: { caja: 'bg-negativo-100 border-negativo-600/30 text-negativo-700', Icono: XCircle },
    advertencia: { caja: 'bg-ambar-100 border-ambar-300 text-ambar-900', Icono: AlertTriangle },
    info: { caja: 'bg-cian-100 border-cian-200 text-azul-600', Icono: Info },
  } as const;
  return (
    <ul className="space-y-2" aria-label="Avisos del cálculo">
      {avisos.map((a, i) => {
        const { caja, Icono } = estilo[a.nivel];
        return (
          <li key={i} className={`flex gap-2 items-start text-xs border rounded-lg px-3 py-2 ${caja}`}>
            <Icono className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{a.mensaje}</span>
          </li>
        );
      })}
    </ul>
  );
}
