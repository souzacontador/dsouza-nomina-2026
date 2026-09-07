import { Shuffle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ETIQUETA_MES, ETIQUETA_ZONA, FACTORES_INTEGRACION } from '../../motor/constantes2026';
import { calcularSBCVariable } from '../../motor/sbcVariable';
import type { MesCalculo, Zona } from '../../motor/tipos';
import { Campo, Renglon, Tarjeta } from '../componentes/Campo';
import { moneda } from '../formato';

export default function VistaSBCVariable() {
  const [cuotaFija, setFija] = useState(300);
  const [factorIdx, setFactorIdx] = useState(0);
  const [totalVariableBimestre, setVar] = useState(12000);
  const [diasBimestre, setDias] = useState(60);
  const [zona, setZona] = useState<Zona>('General');
  const [mes, setMes] = useState<MesCalculo>('Resto');

  const r = useMemo(
    () => calcularSBCVariable({ cuotaFija, factorIntegracion: FACTORES_INTEGRACION[factorIdx].valor, totalVariableBimestre, diasBimestre, zona, mes }),
    [cuotaFija, factorIdx, totalVariableBimestre, diasBimestre, zona, mes],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 space-y-6">
        <Tarjeta titulo="Salario base de cotización variable/mixto" icono={<Shuffle className="w-4 h-4 text-cian-600" />} filete="azul">
          <div className="grid grid-cols-2 gap-4">
            <Campo label="Cuota diaria fija" value={cuotaFija} onValue={setFija} nota="0 si es puramente variable" />
            <label className="block">
              <span className="block text-sm font-medium text-neutro-grafito mb-1">Antigüedad (F.I. de la parte fija)</span>
              <select value={factorIdx} onChange={(e) => setFactorIdx(Number(e.target.value))} className="block w-full py-2 px-2 text-sm border border-neutro-niebla rounded-lg bg-white focus:ring-2 focus:ring-cian-500">
                {FACTORES_INTEGRACION.map((f, i) => <option key={i} value={i}>{f.label} · F.I. {f.valor.toFixed(4)}</option>)}
              </select>
            </label>
            <Campo label="Variables del bimestre" value={totalVariableBimestre} onValue={setVar} nota="Suma de los 2 meses anteriores (art. 30-II)" />
            <Campo label="Días del bimestre" value={diasBimestre} onValue={setDias} prefijo="" step="1" nota="Días de salario devengado (≈60)" />
            <label className="block">
              <span className="block text-sm font-medium text-neutro-grafito mb-1">Zona</span>
              <select value={zona} onChange={(e) => setZona(e.target.value as Zona)} className="block w-full py-2 px-2 text-sm border border-neutro-niebla rounded-lg bg-white focus:ring-2 focus:ring-cian-500">
                {(['General', 'Frontera'] as Zona[]).map((z) => <option key={z} value={z}>{ETIQUETA_ZONA[z]}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-neutro-grafito mb-1">Mes (UMA)</span>
              <select value={mes} onChange={(e) => setMes(e.target.value as MesCalculo)} className="block w-full py-2 px-2 text-sm border border-neutro-niebla rounded-lg bg-white focus:ring-2 focus:ring-cian-500">
                {(Object.keys(ETIQUETA_MES) as MesCalculo[]).map((m) => <option key={m} value={m}>{ETIQUETA_MES[m]}</option>)}
              </select>
            </label>
          </div>
        </Tarjeta>
      </div>

      <div className="lg:col-span-7 space-y-6">
        <Tarjeta titulo="Salario base de cotización" icono={<Shuffle className="w-4 h-4 text-cian-600" />} filete="azul">
          <div className="space-y-1">
            <Renglon k="Parte fija integrada" sub="Cuota fija × factor de integración (art. 30-I)" v={r.fijoIntegrado} tono="text-neutro-grafito" />
            <Renglon k="Promedio variable" sub={`Variables ÷ ${diasBimestre} días (art. 30-II)`} v={r.promedioVariable} tono="text-neutro-grafito" />
            <Renglon k="SBC bruto" v={r.sbcBruto} fuerte />
          </div>
          <div className="mt-3 pt-3 border-t-2 border-azul-600 flex justify-between items-center">
            <span className="font-bold text-azul-600 uppercase">SBC de cotización</span>
            <span className="font-bold text-2xl text-azul-600 font-mono tabular bg-cian-100 px-3 py-1 rounded">{moneda(r.sbcAcotado)}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
            <span className="bg-neutro-arena text-neutro-grafito px-2 py-0.5 rounded">{r.esMixto ? 'Salario mixto (art. 30-III)' : 'Salario variable (art. 30-II)'}</span>
            <span className="bg-neutro-arena text-neutro-grafito px-2 py-0.5 rounded">Piso {moneda(r.pisoSM)} · tope {moneda(r.tope25UMA)}</span>
            {r.topado25UMA && <span className="bg-ambar-100 text-ambar-900 px-2 py-0.5 rounded border border-ambar-300">Topado 25 UMA</span>}
            {r.ajustadoAlPiso && <span className="bg-ambar-100 text-ambar-900 px-2 py-0.5 rounded border border-ambar-300">Ajustado al SM</span>}
          </div>
          <p className="text-[10px] text-neutro-grafito mt-3">Este SBC alimenta las cuotas obrero-patronales de la pestaña Nómina (arts. 27-30 LSS).</p>
        </Tarjeta>
      </div>
    </div>
  );
}
