import { UserCheck } from 'lucide-react';
import type { ResultadoNomina } from '../../motor/tipos';
import { moneda } from '../formato';

interface Props {
  resultado: ResultadoNomina;
}

function Linea({ etiqueta, sub, valor, tono = 'text-azul-600', signo = '' }: { etiqueta: string; sub?: string; valor: number; tono?: string; signo?: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-neutro-arena">
      <div>
        <span className="font-medium text-neutro-grafito block">{etiqueta}</span>
        {sub && <span className="text-xs text-neutro-grafito">{sub}</span>}
      </div>
      <span className={`font-bold font-mono tabular ${tono}`}>{signo}{moneda(valor)}</span>
    </div>
  );
}

export default function ReciboNomina({ resultado: r }: Props) {
  return (
    <section className="bg-white rounded-2xl shadow-md border border-neutro-niebla overflow-hidden">
      <div className="bg-azul-600 p-6 text-white relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <UserCheck className="w-24 h-24" />
        </div>
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h2 className="text-azul-200 font-medium text-xs uppercase tracking-widest mb-1">Neto a recibir ({r.entrada.periodicidad})</h2>
            <div className="text-5xl font-bold tracking-tight font-mono tabular">{moneda(r.neto)}</div>
            <div className="text-azul-200 text-sm mt-2">{r.dias} días · {r.entrada.mes === 'Enero' ? 'enero 2026' : 'feb–dic 2026'}</div>
          </div>
          <div className="text-right space-y-1">
            {r.esSalarioMinimo && (
              <span className="block bg-positivo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">Salario mínimo</span>
            )}
            {r.isr.exentoArt96 && (
              <span className="block bg-cian-600 text-azul-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm">Sin retención ISR · art. 96</span>
            )}
            {r.subsidioAcreditado > 0 && (
              <span className="block bg-acento-600 text-azul-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm">Subsidio acreditado</span>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutro-grafito mb-1">Percepciones</h3>
        <Linea etiqueta="Sueldo ordinario" sub={`${moneda(r.entrada.cuotaDiaria)} × ${r.dias} días`} valor={r.bruto} />
        {r.extras.total > 0 && (
          <Linea
            etiqueta="Tiempo extra y descanso trabajado"
            sub={`Exento ${moneda(r.extras.exento)} · gravado ${moneda(r.extras.gravado)} (art. 93-I LISR)`}
            valor={r.extras.total}
          />
        )}
        <div className="flex justify-between py-2 text-sm">
          <span className="text-neutro-grafito">Total percepciones</span>
          <span className="font-semibold text-neutro-grafito font-mono tabular">{moneda(r.totalPercepciones)}</span>
        </div>

        <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutro-grafito mt-4 mb-1">Deducciones</h3>
        <Linea etiqueta="ISR antes de subsidio" sub={r.isr.exentoArt96 ? 'Exento: percibe únicamente el salario mínimo (art. 96 LISR)' : r.isr.tarifaClave} valor={r.isr.isrAntesSubsidio} tono="text-neutro-grafito" />
        {r.subsidioAcreditado > 0 && (
          <Linea etiqueta="Subsidio para el empleo acreditado" sub="Sólo contra ISR; no se entrega en efectivo" valor={r.subsidioAcreditado} tono="text-positivo-700" signo="− " />
        )}
        <Linea etiqueta="ISR retenido" valor={r.isrRetenido} tono="text-negativo-600" signo="− " />
        <Linea
          etiqueta="Cuota obrera IMSS"
          sub={r.esSalarioMinimo ? `A cargo del patrón: ${moneda(r.cuotaObreraAbsorbida)} (art. 36 LSS)` : undefined}
          valor={r.imssObreroRetenido}
          tono="text-negativo-600"
          signo="− "
        />
      </div>

      <div className="bg-neutro-hueso p-4 border-t border-neutro-niebla flex justify-between text-sm">
        <span className="text-neutro-grafito">Total deducciones</span>
        <span className="font-bold text-neutro-grafito font-mono tabular">{moneda(r.totalDeducciones)}</span>
      </div>
    </section>
  );
}
