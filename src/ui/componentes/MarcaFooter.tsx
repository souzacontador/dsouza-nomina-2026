import isotipo from '../../assets/logos/isotipo.png';
import { MARCA } from '../marca';

/** Pie institucional: isotipo + atribución obligatoria. */
export default function MarcaFooter({ variante = 'app' }: { variante?: 'app' | 'print' }) {
  if (variante === 'print') {
    return (
      <div className="flex items-center justify-between gap-3 border-t border-neutro-niebla pt-3 mt-4">
        <div className="flex items-center gap-2">
          <img src={isotipo} alt="DSouza Consultores Fiscales" className="h-6 w-auto" />
          <span className="text-[10px] text-neutro-grafito">
            <span className="font-semibold text-azul-600">{MARCA.despacho}</span> · {MARCA.ciudad}
          </span>
        </div>
        <span className="text-[9px] text-neutro-grafito">{MARCA.atribucionFooter}</span>
      </div>
    );
  }
  return (
    <footer className="mt-10 border-t border-neutro-niebla pt-6 pb-4 flex flex-col md:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <img src={isotipo} alt="DSouza Consultores Fiscales" className="h-9 w-auto" />
        <div className="leading-tight">
          <div className="font-serif font-bold text-azul-600 text-sm">{MARCA.despacho}</div>
          <div className="text-[11px] text-neutro-grafito">{MARCA.bajada}</div>
        </div>
      </div>
      <div className="text-center md:text-right">
        <p className="text-xs text-neutro-grafito">{MARCA.atribucionFooter}</p>
        <p className="text-[11px] text-neutro-grafito">{MARCA.telefono} · {MARCA.ciudad}</p>
      </div>
    </footer>
  );
}
