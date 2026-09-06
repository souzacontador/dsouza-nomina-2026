import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useState } from 'react';
import type { ResultadoNomina } from '../../motor/tipos';
import { moneda, porcentaje } from '../formato';

interface Props {
  resultado: ResultadoNomina;
}

export default function DesgloseISR({ resultado: r }: Props) {
  const [abierto, setAbierto] = useState(false);
  const { isr, subsidio } = r;
  const filas: [string, string, string?][] = [
    ['Base gravable del periodo', moneda(r.baseGravable), r.extras.gravado > 0 ? `Sueldo ${moneda(r.bruto)} + extra gravado ${moneda(r.extras.gravado)}` : undefined],
    ['Tarifa aplicada', isr.tarifaClave],
    ...(isr.multiplicador > 1 ? [['Base diaria (ingreso ÷ 14)', moneda(isr.baseAplicada)] as [string, string]] : []),
    ['Límite inferior', moneda(isr.renglon?.limInf ?? 0)],
    ['Excedente sobre el límite', moneda(isr.excedente)],
    ['Por ciento sobre excedente', porcentaje(isr.renglon?.pct ?? 0, 2)],
    ['Impuesto marginal', moneda(isr.impuestoMarginal)],
    ['Cuota fija', moneda(isr.renglon?.cuota ?? 0)],
    ...(isr.multiplicador > 1 ? [['Impuesto diario × 14', moneda(isr.isrAntesSubsidio)] as [string, string]] : []),
    ['ISR antes de subsidio', moneda(isr.isrAntesSubsidio)],
    ['Subsidio mensual', moneda(subsidio.subsidioMensual), `UMA mensual ${moneda(subsidio.umaMensual)} × ${porcentaje(subsidio.pctAplicado, 2)}`],
    ['Límite de ingresos del periodo', moneda(subsidio.limitePeriodo), r.entrada.periodicidad === 'Mensual' ? 'Art. Segundo del Decreto' : '11,492.66 ÷ 30.4 × días'],
    ['Subsidio del periodo', moneda(subsidio.subsidioPeriodo), subsidio.aplica ? 'Aplica' : 'No aplica: ingreso mayor al límite'],
    ['Subsidio acreditado', moneda(r.subsidioAcreditado), 'Mínimo entre ISR y subsidio del periodo'],
  ];

  return (
    <section className="bg-cian-100/60 rounded-xl border border-cian-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
        className="w-full flex justify-between items-center p-4 hover:bg-cian-100 transition-colors text-left"
      >
        <span className="flex items-center gap-2 text-azul-600 font-semibold text-sm">
          <Info className="w-4 h-4 text-cian-700" />
          Desglose del cálculo ISR y subsidio
        </span>
        {abierto ? <ChevronUp className="w-4 h-4 text-cian-700" /> : <ChevronDown className="w-4 h-4 text-cian-700" />}
      </button>
      {abierto && (
        <div className="p-5 border-t border-cian-200 bg-white text-sm">
          <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2">
            {filas.map(([k, v, nota]) => (
              <div key={k} className="contents">
                <dt className="text-neutro-grafito">
                  {k}
                  {nota && <span className="block text-[10px] text-neutro-grafito/80">{nota}</span>}
                </dt>
                <dd className="text-right font-mono tabular text-neutro-grafito self-start">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="border-t border-neutro-niebla mt-3 pt-3 flex justify-between font-bold text-azul-600">
            <span>ISR retenido en el periodo</span>
            <span className="font-mono tabular">{moneda(r.isrRetenido)}</span>
          </div>
        </div>
      )}
    </section>
  );
}
