import { ArrowLeft, Printer } from 'lucide-react';
import isotipo from '../../assets/logos/isotipo.png';
import { FUENTES, VERSION_NORMATIVA } from '../../motor/constantes2026';
import type { Celda, ReporteFiscal } from '../../exportar/documento';
import { moneda } from '../formato';
import { MARCA } from '../marca';
import Disclaimer from './Disclaimer';
import MarcaFooter from './MarcaFooter';

const celda = (c: Celda) =>
  typeof c === 'number' ? <span className="font-mono tabular">{moneda(c)}</span> : c;

/** Hoja de impresión con marca DSouza, genérica para cualquier ReporteFiscal. */
export default function HojaImpresion({ reporte, onClose }: { reporte: ReporteFiscal; onClose: () => void }) {
  return (
    <div className="print-root fixed inset-0 z-50 overflow-auto bg-neutro-niebla p-4 md:p-8 flex flex-col items-center">
      <div className="no-print w-full max-w-[21.59cm] mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-md gap-4">
        <button type="button" onClick={onClose} className="flex items-center gap-2 text-neutro-grafito hover:text-azul-600 font-semibold px-4 py-2 hover:bg-neutro-hueso rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" /> Cerrar
        </button>
        <button type="button" onClick={() => window.print()} className="flex items-center gap-2 bg-azul-600 hover:bg-azul-700 text-white px-4 py-2 rounded-lg shadow-sm font-medium text-sm">
          <Printer className="w-4 h-4" /> Imprimir / Guardar PDF
        </button>
      </div>

      <div className="print-sheet bg-white shadow-md w-full max-w-[21.59cm] min-h-[27.94cm] p-[1.5cm] text-azul-600">
        <header className="border-b-2 border-azul-600 pb-4 mb-6 flex justify-between items-end">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-azul-600 shrink-0">
              <img src={isotipo} alt="DSouza Consultores Fiscales" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-azul-600 tracking-tight">{reporte.titulo}</h1>
              <p className="text-sm text-neutro-grafito mt-0.5">{reporte.subtitulo ?? `${MARCA.despacho} · Inteligencia Fiscal Preventiva`}</p>
            </div>
          </div>
          <div className="text-right text-xs text-neutro-grafito">
            <p className="font-bold text-azul-600">{MARCA.profesional}</p>
            <p>Fecha de emisión: {new Date().toLocaleDateString('es-MX')}</p>
            <p className="text-[10px] text-neutro-grafito">{VERSION_NORMATIVA}</p>
          </div>
        </header>

        <section className="mb-6 border border-neutro-niebla rounded-lg overflow-hidden">
          <div className="bg-neutro-hueso px-4 py-2 border-b border-neutro-niebla font-bold text-xs text-azul-600 uppercase">Parámetros</div>
          <div className="grid grid-cols-3 gap-4 p-4 text-xs">
            {reporte.parametros.map(([k, v]) => (
              <div key={k}>
                <span className="block text-neutro-grafito mb-0.5">{k}</span>
                <span className="font-bold text-azul-600">{celda(v)}</span>
              </div>
            ))}
          </div>
        </section>

        {reporte.secciones.map((s) => (
          <section key={s.titulo} className="mb-6 border border-neutro-niebla rounded-lg overflow-hidden">
            <div className="bg-neutro-hueso px-4 py-2 border-b border-neutro-niebla font-bold text-xs text-azul-600 uppercase">{s.titulo}</div>
            <table className="w-full text-xs">
              {s.columnas && (
                <thead className="bg-white text-neutro-grafito border-b border-neutro-niebla">
                  <tr>
                    {s.columnas.map((c, i) => (
                      <th key={c} className={`px-3 py-1.5 font-semibold ${i === 0 ? 'text-left' : 'text-right'}`}>{c}</th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-neutro-arena text-neutro-grafito">
                {s.filas.map((f, ri) => (
                  <tr key={ri}>
                    {f.map((c, ci) => (
                      <td key={ci} className={`px-3 py-1 ${ci === 0 ? 'text-left' : 'text-right'} ${ci === 0 ? '' : 'font-mono tabular'}`}>
                        {celda(c)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}

        {reporte.totalEtiqueta !== undefined && reporte.totalValor !== undefined && (
          <div className="border-t-2 border-azul-600 pt-3 mb-6 flex justify-end items-center gap-4">
            <span className="font-bold text-azul-600 uppercase">{reporte.totalEtiqueta}:</span>
            <span className="font-bold text-xl text-azul-600 bg-cian-100 px-3 py-1 rounded font-mono tabular">{moneda(reporte.totalValor)}</span>
          </div>
        )}

        <div className="mb-3"><Disclaimer compacta /></div>
        <details className="text-[9px] text-neutro-grafito mb-2">
          <summary className="cursor-pointer font-semibold">Fuentes normativas</summary>
          <ul className="list-disc pl-4 space-y-0.5 mt-1">
            {(reporte.fuentes ?? FUENTES).map((f) => <li key={f}>{f}</li>)}
          </ul>
        </details>
        <MarcaFooter variante="print" />
      </div>
    </div>
  );
}
