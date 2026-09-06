import { DollarSign } from 'lucide-react';
import { ETIQUETA_JORNADA, ETIQUETA_MES, ETIQUETA_ZONA, PERIODOS } from '../../motor/constantes2026';
import type { EntradaNomina, MesCalculo, Periodicidad, ResultadoNomina, TipoJornada, Zona } from '../../motor/tipos';
import { moneda } from '../formato';
import InputNumero from './InputNumero';

interface Props {
  entrada: EntradaNomina;
  resultado: ResultadoNomina;
  actualizar: (patch: Partial<EntradaNomina>) => void;
}

const selectCls =
  'block w-full py-2 px-2 text-sm border border-neutro-niebla rounded-lg bg-white focus:ring-2 focus:ring-cian-500 focus:border-cian-500';
const labelCls = 'block text-sm font-medium text-neutro-grafito mb-2';

export default function PanelDatosGenerales({ entrada, resultado, actualizar }: Props) {
  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-neutro-niebla relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-cian-600" aria-hidden />
      <h2 className="font-serif text-base font-bold text-azul-600 mb-5 flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-cian-600" />
        Datos generales
      </h2>

      <div className="mb-5">
        <label htmlFor="cuotaDiaria" className={labelCls}>Salario cuota diaria</label>
        <InputNumero
          id="cuotaDiaria"
          value={entrada.cuotaDiaria}
          onValue={(v) => actualizar({ cuotaDiaria: v })}
          prefijo="$"
          step="0.01"
          min="0"
          placeholder="0.00"
          className="block w-full pr-3 py-3 border border-neutro-niebla rounded-lg focus:ring-2 focus:ring-cian-500 focus:border-cian-500 text-xl font-bold text-azul-600 bg-white font-mono tabular"
        />
        <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
          <span className="bg-neutro-arena text-neutro-grafito px-2 py-0.5 rounded">SM zona: {moneda(resultado.salarioMinimo)}</span>
          <span className="bg-neutro-arena text-neutro-grafito px-2 py-0.5 rounded">UMA: {moneda(resultado.uma)}</span>
          {resultado.esSalarioMinimo && (
            <span className="bg-positivo-100 text-positivo-700 px-2 py-0.5 rounded font-semibold">Trabajador de salario mínimo</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="periodicidad" className={labelCls}>Periodicidad</label>
          <select id="periodicidad" value={entrada.periodicidad} onChange={(e) => actualizar({ periodicidad: e.target.value as Periodicidad })} className={selectCls}>
            {(Object.keys(PERIODOS) as Periodicidad[]).map((p) => (
              <option key={p} value={p}>{PERIODOS[p].label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="mes" className={labelCls}>Mes de cálculo</label>
          <select id="mes" value={entrada.mes} onChange={(e) => actualizar({ mes: e.target.value as MesCalculo })} className={selectCls}>
            {(Object.keys(ETIQUETA_MES) as MesCalculo[]).map((m) => (
              <option key={m} value={m}>{ETIQUETA_MES[m]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="jornada" className={labelCls}>Jornada (valor hora, art. 61 LFT)</label>
          <select id="jornada" value={entrada.jornada} onChange={(e) => actualizar({ jornada: e.target.value as TipoJornada })} className={selectCls}>
            {(Object.keys(ETIQUETA_JORNADA) as TipoJornada[]).map((j) => (
              <option key={j} value={j}>{ETIQUETA_JORNADA[j]}</option>
            ))}
          </select>
        </div>

        <div>
          <span className={labelCls}>Zona económica</span>
          <div className="flex gap-2" role="group" aria-label="Zona económica">
            {(['General', 'Frontera'] as Zona[]).map((z) => {
              const activa = entrada.zona === z;
              return (
                <button
                  key={z}
                  type="button"
                  onClick={() => actualizar({ zona: z })}
                  aria-pressed={activa}
                  className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all border ${
                    activa ? 'bg-azul-600 text-white border-azul-700 ring-2 ring-cian-200' : 'bg-white text-neutro-grafito border-neutro-niebla hover:bg-neutro-hueso'
                  }`}
                >
                  {ETIQUETA_ZONA[z]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
