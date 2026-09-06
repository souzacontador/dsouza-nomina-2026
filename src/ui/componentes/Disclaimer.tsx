import { Info } from 'lucide-react';
import { MARCA } from '../marca';

/** Leyenda institucional obligatoria. Variante compacta para impresión. */
export default function Disclaimer({ compacta = false }: { compacta?: boolean }) {
  if (compacta) {
    return <p className="text-[9px] leading-snug text-neutro-grafito text-center">{MARCA.leyenda}</p>;
  }
  return (
    <aside className="flex gap-2 items-start bg-neutro-arena border border-neutro-niebla rounded-xl px-4 py-3" role="note">
      <Info className="w-4 h-4 mt-0.5 shrink-0 text-azul-500" />
      <p className="text-xs leading-relaxed text-neutro-grafito">{MARCA.leyenda}</p>
    </aside>
  );
}
