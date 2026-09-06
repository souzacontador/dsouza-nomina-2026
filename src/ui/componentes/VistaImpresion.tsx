import { ArrowLeft, Printer, ShieldCheck, UserCheck } from 'lucide-react';
import isotipo from '../../assets/logos/isotipo.png';
import { ETIQUETA_JORNADA, ETIQUETA_MES, ETIQUETA_ZONA, FUENTES, VERSION_NORMATIVA } from '../../motor/constantes2026';
import type { ResultadoNomina } from '../../motor/tipos';
import { moneda } from '../formato';
import Disclaimer from './Disclaimer';
import Leyendas from './Leyendas';
import MarcaFooter from './MarcaFooter';
import TablaCostoSocial from './TablaCostoSocial';
import { MARCA } from '../marca';

interface Props {
  resultado: ResultadoNomina;
  onVolver: () => void;
}

function Dato({ k, v, sub }: { k: string; v: string; sub?: string }) {
  return (
    <div>
      <span className="block text-neutro-grafito mb-1">{k}</span>
      <span className="font-bold text-azul-600">{v}</span>
      {sub && <span className="text-[10px] text-neutro-grafito block">{sub}</span>}
    </div>
  );
}

function Renglon({ k, v, tono = '', signo = '' }: { k: string; v: number; tono?: string; signo?: string }) {
  return (
    <div className={`flex justify-between border-b border-neutro-arena pb-1 ${tono}`}>
      <span>{k}</span>
      <span className="font-mono tabular">{signo}{moneda(v)}</span>
    </div>
  );
}

export default function VistaImpresion({ resultado: r, onVolver }: Props) {
  const e = r.entrada;
  return (
    <div className="print-root bg-neutro-niebla min-h-screen p-4 md:p-8 flex flex-col items-center">
      <div className="no-print w-full max-w-[21.59cm] mb-6 flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-md gap-4">
        <button type="button" onClick={onVolver} className="flex items-center gap-2 text-neutro-grafito hover:text-azul-600 font-semibold px-4 py-2 hover:bg-neutro-hueso rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" /> Volver a editar
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
              <h1 className="font-serif text-xl font-bold text-azul-600 tracking-tight">Calculadora Nómina 2026 y Carga Social</h1>
              <p className="text-sm text-neutro-grafito mt-0.5">{MARCA.despacho} · Inteligencia Fiscal Preventiva</p>
            </div>
          </div>
          <div className="text-right text-xs text-neutro-grafito">
            <p className="font-bold text-azul-600">{MARCA.profesional}</p>
            <p>Fecha de emisión: {new Date().toLocaleDateString('es-MX')}</p>
            <p className="text-[10px] text-neutro-grafito">{VERSION_NORMATIVA}</p>
          </div>
        </header>

        <section className="mb-6 border border-neutro-niebla rounded-lg overflow-hidden">
          <div className="bg-neutro-hueso px-4 py-2 border-b border-neutro-niebla font-bold text-xs text-azul-600 uppercase">Parámetros generales</div>
          <div className="grid grid-cols-4 gap-4 p-4 text-xs">
            <Dato k="Periodo" v={`${e.periodicidad} (${r.dias} días)`} sub={ETIQUETA_MES[e.mes]} />
            <Dato k="Zona económica" v={ETIQUETA_ZONA[e.zona]} sub={`SM ${moneda(r.salarioMinimo)} · UMA ${moneda(r.uma)}`} />
            <Dato k="Cuota diaria" v={moneda(e.cuotaDiaria)} sub={r.esSalarioMinimo ? 'Trabajador de salario mínimo' : ETIQUETA_JORNADA[e.jornada]} />
            <Dato k="SBC de cotización" v={moneda(r.sbc.sbcAcotado)} sub={`Factor ${r.sbc.factorAplicado.toFixed(4)}${r.sbc.topado25UMA ? ' · topado 25 UMA' : ''}`} />
          </div>
        </section>

        <section className="mb-6 border border-neutro-niebla rounded-lg overflow-hidden">
          <div className="bg-neutro-hueso px-4 py-2 border-b border-neutro-niebla font-bold text-xs text-azul-600 uppercase flex items-center gap-2">
            <UserCheck className="w-3 h-3" /> Liquidación al trabajador
          </div>
          <div className="p-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-wider text-neutro-grafito font-bold">Percepciones</div>
                <Renglon k="(+) Sueldo ordinario" v={r.bruto} />
                {r.extras.total > 0 && (
                  <>
                    <Renglon k="(+) Horas extra dobles" v={r.extras.pagoHorasDobles} />
                    {r.extras.pagoHorasTriples > 0 && <Renglon k="(+) Horas extra triples" v={r.extras.pagoHorasTriples} />}
                    {r.extras.pagoDescanso > 0 && <Renglon k="(+) Descanso trabajado (art. 73 LFT)" v={r.extras.pagoDescanso} />}
                    <Renglon k="Exento art. 93-I LISR" v={r.extras.exento} tono="text-positivo-700" />
                    <Renglon k="Gravado" v={r.extras.gravado} tono="text-neutro-grafito" />
                  </>
                )}
                <Renglon k="Total percepciones" v={r.totalPercepciones} tono="font-semibold" />
              </div>
              <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-wider text-neutro-grafito font-bold">Deducciones</div>
                <Renglon k="ISR antes de subsidio" v={r.isr.isrAntesSubsidio} tono="text-neutro-grafito" />
                {r.subsidioAcreditado > 0 && <Renglon k="(−) Subsidio para el empleo acreditado" v={r.subsidioAcreditado} tono="text-positivo-700" signo="−" />}
                <Renglon k="(−) ISR retenido" v={r.isrRetenido} tono="text-negativo-600" signo="−" />
                <Renglon k={r.esSalarioMinimo ? '(−) IMSS obrero (a cargo del patrón, art. 36 LSS)' : '(−) IMSS obrero'} v={r.imssObreroRetenido} tono="text-negativo-600" signo="−" />
                <Renglon k="Total deducciones" v={r.totalDeducciones} tono="font-semibold" />
              </div>
            </div>
            <div className="border-t-2 border-azul-600 pt-3 mt-2 flex justify-end items-center gap-4">
              <span className="font-bold text-azul-600 uppercase">Neto a pagar:</span>
              <span className="font-bold text-xl text-azul-600 bg-cian-100 px-3 py-1 rounded font-mono tabular">{moneda(r.neto)}</span>
            </div>
          </div>
        </section>

        <section className="border border-neutro-niebla rounded-lg overflow-hidden mb-6">
          <div className="bg-azul-600 text-white px-4 py-2 font-bold text-xs uppercase flex items-center gap-2">
            <ShieldCheck className="w-3 h-3 text-cian-400" /> Costo social (liquidación IMSS e INFONAVIT 2026)
          </div>
          <TablaCostoSocial resultado={r} compacta />
        </section>

        {r.leyendas.length > 0 && (
          <section className="mb-6">
            <div className="font-bold text-xs text-azul-600 uppercase mb-2">Leyendas normativas</div>
            <Leyendas leyendas={r.leyendas} compacta />
          </section>
        )}

        <p className="font-bold text-azul-600 text-[11px] mb-4 text-center bg-neutro-hueso border border-neutro-niebla rounded py-2">
          Costo total empresa (percepciones + carga social): <span className="font-mono tabular">{moneda(r.costoTotalEmpresa)}</span>
        </p>

        <div className="mb-3"><Disclaimer compacta /></div>

        <details className="text-[9px] text-neutro-grafito mb-2">
          <summary className="cursor-pointer font-semibold">Fuentes normativas</summary>
          <ul className="list-disc pl-4 space-y-0.5 mt-1">
            {FUENTES.map((f) => (<li key={f}>{f}</li>))}
          </ul>
        </details>

        <MarcaFooter variante="print" />
      </div>
    </div>
  );
}
