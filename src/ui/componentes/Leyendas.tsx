import { Scale } from 'lucide-react';
import type { Leyenda } from '../../motor/tipos';

export default function Leyendas({ leyendas, compacta = false }: { leyendas: Leyenda[]; compacta?: boolean }) {
  if (leyendas.length === 0) return null;
  const color: Record<Leyenda['ambito'], string> = {
    ISR: 'border-l-negativo-600',
    IMSS: 'border-l-azul-500',
    LFT: 'border-l-acento-600',
    Subsidio: 'border-l-cian-600',
  };
  return (
    <section aria-label="Leyendas normativas" className={compacta ? 'space-y-2' : 'space-y-3'}>
      {!compacta && (
        <h3 className="font-serif text-sm font-bold text-azul-600 flex items-center gap-2">
          <Scale className="w-4 h-4 text-cian-600" /> Leyendas normativas del periodo
        </h3>
      )}
      {leyendas.map((l, i) => (
        <article key={i} className={`bg-white border border-neutro-niebla border-l-4 ${color[l.ambito]} rounded-lg ${compacta ? 'px-3 py-2' : 'px-4 py-3'}`}>
          <div className={`flex items-center gap-2 ${compacta ? 'text-[10px]' : 'text-xs'}`}>
            <span className="uppercase tracking-wider font-bold text-neutro-grafito">{l.ambito}</span>
            <span className="font-semibold text-azul-600">{l.titulo}</span>
          </div>
          <p className={`text-neutro-grafito mt-1 ${compacta ? 'text-[10px]' : 'text-xs'}`}>{l.texto}</p>
          <p className={`text-neutro-grafito mt-1 italic ${compacta ? 'text-[9px]' : 'text-[11px]'}`}>Fundamento: {l.fundamento}</p>
        </article>
      ))}
    </section>
  );
}
