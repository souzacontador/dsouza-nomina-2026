import { CalendarRange, Calculator, ChevronDown, ChevronUp, FileMinus, FileSpreadsheet, Gift, PieChart, Printer, ShieldCheck, Shuffle, UserCog } from 'lucide-react';
import { useMemo, useState } from 'react';
import isotipo from '../assets/logos/isotipo.png';
import { exportarCSV } from '../exportar/csv';
import { VERSION_NORMATIVA } from '../motor/constantes2026';
import { calcularNomina, normalizarSemanas } from '../motor/nomina';
import { semanasDelPeriodo } from '../motor/percepcionesExtra';
import type { EntradaNomina, SemanaExtra } from '../motor/tipos';
import Avisos from './componentes/Avisos';
import DesgloseISR from './componentes/DesgloseISR';
import Disclaimer from './componentes/Disclaimer';
import Leyendas from './componentes/Leyendas';
import MarcaFooter from './componentes/MarcaFooter';
import PanelDatosGenerales from './componentes/PanelDatosGenerales';
import PanelTiempoExtra from './componentes/PanelTiempoExtra';
import PanelVariablesIMSS from './componentes/PanelVariablesIMSS';
import ReciboNomina from './componentes/ReciboNomina';
import TablaCostoSocial from './componentes/TablaCostoSocial';
import VistaImpresion from './componentes/VistaImpresion';
import { moneda } from './formato';
import VistaConceptos from './vistas/VistaConceptos';
import VistaFiniquito from './vistas/VistaFiniquito';
import VistaISRAnual from './vistas/VistaISRAnual';
import VistaSBCVariable from './vistas/VistaSBCVariable';

type Tab = 'nomina' | 'conceptos' | 'finiquito' | 'anual' | 'sbc';

const TABS: { id: Tab; label: string; Icono: typeof Calculator }[] = [
  { id: 'nomina', label: 'Nómina', Icono: UserCog },
  { id: 'conceptos', label: 'Aguinaldo / PTU', Icono: Gift },
  { id: 'finiquito', label: 'Finiquito', Icono: FileMinus },
  { id: 'anual', label: 'ISR anual', Icono: CalendarRange },
  { id: 'sbc', label: 'SBC variable', Icono: Shuffle },
];

const ENTRADA_INICIAL: EntradaNomina = {
  cuotaDiaria: 500,
  periodicidad: 'Quincenal',
  zona: 'General',
  mes: 'Resto',
  modoSBC: 'Antiguedad',
  factorIdx: 0,
  sbcManual: 524.65,
  primaRiesgoPct: 0.5,
  jornada: 'Diurna',
  semanas: [],
};

export default function App() {
  const [tab, setTab] = useState<Tab>('nomina');
  const [entrada, setEntrada] = useState<EntradaNomina>(ENTRADA_INICIAL);
  const [vista, setVista] = useState<'app' | 'print'>('app');
  const [mostrarImss, setMostrarImss] = useState(true);

  const actualizar = (patch: Partial<EntradaNomina>) => setEntrada((prev) => ({ ...prev, ...patch }));
  const actualizarSemana = (i: number, patch: Partial<SemanaExtra>) =>
    setEntrada((prev) => {
      const semanas = normalizarSemanas(prev.semanas, semanasDelPeriodo(prev.periodicidad));
      semanas[i] = { ...semanas[i], ...patch };
      return { ...prev, semanas };
    });

  const resultado = useMemo(() => calcularNomina(entrada), [entrada]);

  if (vista === 'print') return <VistaImpresion resultado={resultado} onVolver={() => setVista('app')} />;

  return (
    <div className="min-h-screen bg-neutro-hueso text-azul-600 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-azul-600 shrink-0 shadow-sm">
              <img src={isotipo} alt="DSouza Consultores Fiscales" className="w-9 h-9 object-contain" />
            </div>
            <div>
              <h1 className="font-serif text-2xl md:text-[28px] font-bold text-azul-600 leading-tight">Calculadora Nómina 2026 y Carga Social</h1>
              <p className="text-neutro-grafito mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="bg-cian-600 text-azul-900 px-2 py-0.5 rounded text-xs font-semibold">Inteligencia Fiscal Preventiva</span>
                ISR, subsidio, IMSS/INFONAVIT, LFT · <span className="text-[10px] text-neutro-grafito">{VERSION_NORMATIVA}</span>
              </p>
            </div>
          </div>
          {tab === 'nomina' && (
            <div className="flex gap-2 no-print">
              <button type="button" onClick={() => setVista('print')} className="flex items-center gap-2 bg-azul-600 hover:bg-azul-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all font-medium text-sm focus:outline-none focus:ring-2 focus:ring-azul-400">
                <Printer className="w-4 h-4" /> PDF / Imprimir
              </button>
              <button type="button" onClick={() => exportarCSV(resultado)} className="flex items-center gap-2 bg-cian-600 hover:bg-cian-700 text-azul-900 px-4 py-2 rounded-lg shadow-sm transition-all font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-cian-400">
                <FileSpreadsheet className="w-4 h-4" /> Excel (CSV)
              </button>
            </div>
          )}
        </header>

        {/* Pestañas */}
        <nav className="mb-8 flex gap-1 overflow-x-auto border-b border-neutro-niebla" role="tablist" aria-label="Herramientas">
          {TABS.map(({ id, label, Icono }) => {
            const activa = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activa}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors focus:outline-none focus:ring-2 focus:ring-cian-400 rounded-t ${
                  activa ? 'border-cian-600 text-azul-600' : 'border-transparent text-neutro-grafito hover:text-azul-600 hover:border-neutro-niebla'
                }`}
              >
                <Icono className="w-4 h-4" /> {label}
              </button>
            );
          })}
        </nav>

        {tab === 'nomina' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
              <div className="lg:col-span-5 space-y-6">
                <PanelDatosGenerales entrada={entrada} resultado={resultado} actualizar={actualizar} />
                <PanelVariablesIMSS entrada={entrada} resultado={resultado} actualizar={actualizar} />
                <PanelTiempoExtra entrada={entrada} resultado={resultado} actualizarSemana={actualizarSemana} />
              </div>
              <div className="lg:col-span-7 space-y-6">
                <Avisos avisos={resultado.avisos} />
                <ReciboNomina resultado={resultado} />
                <DesgloseISR resultado={resultado} />
                <Leyendas leyendas={resultado.leyendas} />
              </div>
            </div>

            <section className="bg-white rounded-2xl shadow-sm border border-neutro-niebla overflow-hidden">
              <button
                type="button"
                className="w-full bg-azul-600 px-6 py-4 flex justify-between items-center text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cian-400"
                onClick={() => setMostrarImss(!mostrarImss)}
                aria-expanded={mostrarImss}
              >
                <span className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-cian-400" />
                  <span>
                    <span className="block text-white font-serif font-bold text-lg">Costo social total (liquidación IMSS e INFONAVIT 2026)</span>
                    <span className="block text-azul-200 text-xs">Desglose de cuotas obrero-patronales por rama · LSS última reforma DOF 15-01-2026</span>
                  </span>
                </span>
                {mostrarImss ? <ChevronUp className="text-azul-200" /> : <ChevronDown className="text-azul-200" />}
              </button>
              {mostrarImss && <TablaCostoSocial resultado={resultado} />}
              <div className="bg-neutro-hueso p-4 text-center border-t border-neutro-niebla">
                <p className="mt-1 flex justify-center gap-2 items-center text-sm font-semibold text-azul-600">
                  <PieChart className="w-4 h-4 text-cian-600" /> Costo total empresa (percepciones + carga social):
                  <span className="font-mono tabular">{moneda(resultado.costoTotalEmpresa)}</span>
                </p>
              </div>
            </section>
          </>
        )}

        {tab === 'conceptos' && <VistaConceptos />}
        {tab === 'finiquito' && <VistaFiniquito />}
        {tab === 'anual' && <VistaISRAnual />}
        {tab === 'sbc' && <VistaSBCVariable />}

        <div className="mt-8">
          <Disclaimer />
        </div>
        <MarcaFooter />
      </div>
    </div>
  );
}
