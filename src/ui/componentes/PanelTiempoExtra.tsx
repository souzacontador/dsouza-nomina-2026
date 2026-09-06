import { Clock } from 'lucide-react';
import { LFT_2026 } from '../../motor/constantes2026';
import type { EntradaNomina, ResultadoNomina, SemanaExtra } from '../../motor/tipos';
import { moneda } from '../formato';
import InputNumero from './InputNumero';

interface Props {
  entrada: EntradaNomina;
  resultado: ResultadoNomina;
  actualizarSemana: (indice: number, patch: Partial<SemanaExtra>) => void;
}

export default function PanelTiempoExtra({ entrada, resultado, actualizarSemana }: Props) {
  const { extras } = resultado;
  const semanas = resultado.entrada.semanas;
  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-neutro-niebla relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-acento-600" aria-hidden />
      <h2 className="font-serif text-base font-bold text-azul-600 mb-2 flex items-center gap-2">
        <Clock className="w-4 h-4 text-acento-700" />
        Tiempo extra y descanso trabajado
      </h2>
      <p className="text-[11px] text-neutro-grafito mb-4">
        Captura por semana real de servicios. Límite 2026: {LFT_2026.horasExtraMaxSemana} h/semana al doble (art. 66 LFT); hasta {LFT_2026.horasArt68MaxSemana} h más al triple (art. 68). Valor hora {moneda(extras.valorHora)} = cuota diaria ÷ {extras.horasJornada} h ({entrada.jornada.toLowerCase()}).
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-neutro-grafito">
            <tr>
              <th className="text-left py-1 font-semibold">Semana</th>
              <th className="text-left py-1 font-semibold">Horas extra</th>
              <th className="text-left py-1 font-semibold">Días descanso trabajados</th>
              <th className="text-right py-1 font-semibold">Pago</th>
            </tr>
          </thead>
          <tbody>
            {semanas.map((s, i) => {
              const res = extras.semanas[i];
              return (
                <tr key={i} className="border-t border-neutro-arena">
                  <td className="py-1.5 font-medium text-neutro-grafito">{i + 1}</td>
                  <td className="py-1.5 pr-2">
                    <InputNumero
                      aria-label={`Horas extra semana ${i + 1}`}
                      value={s.horasExtra}
                      onValue={(v) => actualizarSemana(i, { horasExtra: v })}
                      step="0.5"
                      min="0"
                      className="w-24 py-1 px-2 border border-neutro-niebla rounded focus:ring-2 focus:ring-acento-500 text-right font-mono tabular"
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <InputNumero
                      aria-label={`Días de descanso trabajados semana ${i + 1}`}
                      value={s.diasDescansoTrabajados}
                      onValue={(v) => actualizarSemana(i, { diasDescansoTrabajados: v })}
                      step="1"
                      min="0"
                      className="w-20 py-1 px-2 border border-neutro-niebla rounded focus:ring-2 focus:ring-acento-500 text-right font-mono tabular"
                    />
                  </td>
                  <td className="py-1.5 text-right font-mono tabular text-neutro-grafito">
                    {moneda(res?.totalSemana ?? 0)}
                    {res && (res.horasArt68 > 0 || res.horasExceso > 0) && (
                      <span className="block text-[10px] text-ambar-800">{res.horasArt68 + res.horasExceso} h triples</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {extras.total > 0 && (
        <div className="mt-4 pt-3 border-t border-neutro-niebla grid grid-cols-2 gap-x-6 gap-y-1 text-xs font-mono tabular">
          <span className="text-neutro-grafito font-sans">Horas dobles ({extras.horasDentroLimite} h)</span>
          <span className="text-right">{moneda(extras.pagoHorasDobles)}</span>
          <span className="text-neutro-grafito font-sans">Horas triples ({extras.horasArt68 + extras.horasExceso} h)</span>
          <span className="text-right">{moneda(extras.pagoHorasTriples)}</span>
          <span className="text-neutro-grafito font-sans">Descanso trabajado ({extras.diasDescansoTrabajados} d)</span>
          <span className="text-right">{moneda(extras.pagoDescanso)}</span>
          <span className="text-azul-600 font-semibold font-sans border-t border-neutro-niebla pt-1">Total percepciones extra</span>
          <span className="text-right font-semibold border-t border-neutro-niebla pt-1">{moneda(extras.total)}</span>
          <span className="text-positivo-700 font-sans">Exento ISR (art. 93-I)</span>
          <span className="text-right text-positivo-700">{moneda(extras.exento)}</span>
          <span className="text-negativo-600 font-sans">Gravado ISR</span>
          <span className="text-right text-negativo-600">{moneda(extras.gravado)}</span>
          <span className="col-span-2 text-[10px] text-neutro-grafito font-sans">
            Régimen: {extras.regimen === 'SalarioMinimo' ? '100 % exento dentro de límites (salario mínimo)' : '50 % exento, tope 5 UMA por semana (demás trabajadores)'}
          </span>
        </div>
      )}
    </section>
  );
}
