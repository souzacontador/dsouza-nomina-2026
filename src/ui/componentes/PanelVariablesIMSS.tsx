import { Briefcase } from 'lucide-react';
import { FACTORES_INTEGRACION, LSS } from '../../motor/constantes2026';
import type { EntradaNomina, ResultadoNomina } from '../../motor/tipos';
import { moneda } from '../formato';
import InputNumero from './InputNumero';

interface Props {
  entrada: EntradaNomina;
  resultado: ResultadoNomina;
  actualizar: (patch: Partial<EntradaNomina>) => void;
}

export default function PanelVariablesIMSS({ entrada, resultado, actualizar }: Props) {
  const { sbc } = resultado;
  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-neutro-niebla relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-azul-500" aria-hidden />
      <h2 className="font-serif text-base font-bold text-azul-600 mb-5 flex items-center gap-2">
        <Briefcase className="w-4 h-4 text-azul-500" />
        Variables IMSS
      </h2>

      <div className="mb-4">
        <label htmlFor="primaRiesgo" className="block text-sm font-medium text-neutro-grafito mb-2">
          Prima de riesgo de trabajo (%)
        </label>
        <InputNumero
          id="primaRiesgo"
          value={entrada.primaRiesgoPct}
          onValue={(v) => actualizar({ primaRiesgoPct: v })}
          step="0.00001"
          min={String(LSS.riesgoTrabajo.primaMinimaPct)}
          max={String(LSS.riesgoTrabajo.primaMaximaPct)}
          sufijo="%"
          className="block w-full py-2 px-3 border border-neutro-niebla rounded-lg focus:ring-2 focus:ring-cian-500 font-mono tabular text-azul-600"
        />
        <p className="text-[10px] text-neutro-grafito mt-1">
          Mínima de ley {LSS.riesgoTrabajo.primaMinimaPct} % · máxima {LSS.riesgoTrabajo.primaMaximaPct} % (art. 74 LSS) · prima media clase I {LSS.riesgoTrabajo.primaMediaClaseIPct} % (art. 73)
        </p>
      </div>

      <div className="flex items-center justify-between mb-4 bg-neutro-hueso p-2 rounded-lg border border-neutro-niebla">
        <span className="text-xs font-semibold text-azul-600 px-2">Cálculo SBC:</span>
        <div className="flex gap-2" role="group" aria-label="Modo de cálculo del SBC">
          {(['Antiguedad', 'Manual'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => actualizar({ modoSBC: m })}
              aria-pressed={entrada.modoSBC === m}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                entrada.modoSBC === m ? 'bg-cian-600 text-azul-900 shadow-sm' : 'text-azul-600 hover:bg-cian-100'
              }`}
            >
              {m === 'Antiguedad' ? 'Antigüedad' : 'Manual'}
            </button>
          ))}
        </div>
      </div>

      {entrada.modoSBC === 'Antiguedad' ? (
        <select
          aria-label="Antigüedad para factor de integración"
          value={entrada.factorIdx}
          onChange={(e) => actualizar({ factorIdx: Number(e.target.value) })}
          className="block w-full py-2 px-3 border border-neutro-niebla rounded-lg focus:ring-2 focus:ring-cian-500 bg-white text-sm"
        >
          {FACTORES_INTEGRACION.map((item, idx) => (
            <option key={idx} value={idx}>
              {item.label} · {item.vac} días vac. · F.I. {item.valor.toFixed(4)}
            </option>
          ))}
        </select>
      ) : (
        <InputNumero
          aria-label="SBC manual"
          value={entrada.sbcManual}
          onValue={(v) => actualizar({ sbcManual: v })}
          prefijo="$"
          step="0.01"
          min="0"
          placeholder="SBC diario"
          className="block w-full py-2 px-3 border border-neutro-niebla rounded-lg focus:ring-2 focus:ring-cian-500 text-azul-600 font-semibold font-mono tabular"
        />
      )}

      <div className="mt-4 pt-4 border-t border-neutro-niebla flex justify-between items-start">
        <div className="text-sm text-neutro-grafito">
          <div>SBC de cotización</div>
          <div className="text-[10px] text-neutro-grafito">Factor aplicado {sbc.factorAplicado.toFixed(4)} · piso {moneda(sbc.pisoSM)} · tope {moneda(sbc.tope25UMA)}</div>
        </div>
        <div className="text-right">
          <div className="font-bold text-azul-600 text-lg font-mono tabular">{moneda(sbc.sbcAcotado)}</div>
          {sbc.topado25UMA && (
            <span className="text-[10px] bg-ambar-100 text-ambar-900 px-1.5 py-0.5 rounded border border-ambar-300 inline-block mt-1">Topado 25 UMA</span>
          )}
          {sbc.ajustadoAlPiso && (
            <span className="text-[10px] bg-ambar-100 text-ambar-900 px-1.5 py-0.5 rounded border border-ambar-300 inline-block mt-1">Ajustado al SM</span>
          )}
        </div>
      </div>
    </section>
  );
}
