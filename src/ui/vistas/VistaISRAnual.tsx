import { AlertTriangle, CalendarRange } from 'lucide-react';
import { useMemo, useState } from 'react';
import { calcularISRAnual } from '../../motor/isrAnual';
import type { ReporteFiscal } from '../../exportar/documento';
import AccionesExport from '../componentes/AccionesExport';
import { Campo, Renglon, Tarjeta } from '../componentes/Campo';
import { moneda } from '../formato';

export default function VistaISRAnual() {
  const [ingreso, setIngreso] = useState(180000);
  const [retenido, setRetenido] = useState(15000);
  const r = useMemo(() => calcularISRAnual({ ingresoGravableAnual: ingreso, isrRetenidoAnual: retenido }), [ingreso, retenido]);

  const reporte = (): ReporteFiscal => ({
    titulo: 'ISR anual del ejercicio 2026',
    archivo: 'ISR_Anual_2026',
    parametros: [
      ['Ingreso gravable anual', ingreso],
      ['ISR retenido', retenido],
    ],
    secciones: [
      {
        titulo: 'Cálculo (art. 152 LISR)',
        filas: [
          ['Límite inferior del tramo', r.renglon?.limInf ?? 0],
          ['Excedente', r.excedente],
          ['Impuesto marginal', r.impuestoMarginal],
          ['Cuota fija', r.cuotaFija],
          ['ISR anual', r.isrAnual],
          ['ISR retenido', r.isrRetenidoAnual],
          [r.aFavor ? 'Saldo a favor' : 'Saldo a cargo', Math.abs(r.saldo)],
        ],
      },
    ],
    fuentes: [r.tarifaClave],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="font-serif text-lg font-bold text-azul-600">ISR anual del ejercicio</h2>
        <AccionesExport construir={reporte} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 space-y-6">
        <Tarjeta titulo="Cálculo anual (art. 152 LISR)" icono={<CalendarRange className="w-4 h-4 text-cian-600" />}>
          <div className="space-y-4">
            <Campo label="Ingreso gravable anual" value={ingreso} onValue={setIngreso} nota="Suma de percepciones gravadas del ejercicio por sueldos" />
            <Campo label="ISR retenido en el año" value={retenido} onValue={setRetenido} nota="Total de retenciones efectuadas por el patrón" />
          </div>
          {!r.tarifaVerificada ? (
            <div className="mt-4 flex gap-2 items-start bg-ambar-100 border border-ambar-300 rounded-lg px-3 py-2 text-xs text-ambar-900">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Tarifa anual derivada; pendiente de cotejo con el DOF.</span>
            </div>
          ) : (
            <p className="mt-4 text-[10px] text-neutro-grafito">Tarifa anual: Anexo 8 RMF, rubro C.II (DOF 28-12-2025), verificada.</p>
          )}
        </Tarjeta>
      </div>

      <div className="lg:col-span-7 space-y-6">
        <Tarjeta titulo="Resultado del ejercicio" icono={<CalendarRange className="w-4 h-4 text-cian-600" />}>
          <div className="space-y-1">
            <Renglon k="Límite inferior del tramo" v={r.renglon?.limInf ?? 0} tono="text-neutro-grafito" />
            <Renglon k="Excedente" v={r.excedente} tono="text-neutro-grafito" />
            <Renglon k="Impuesto marginal" v={r.impuestoMarginal} tono="text-neutro-grafito" />
            <Renglon k="Cuota fija" v={r.cuotaFija} tono="text-neutro-grafito" />
            <Renglon k="ISR anual (art. 152)" v={r.isrAnual} fuerte />
            <Renglon k="(−) ISR retenido" v={r.isrRetenidoAnual} tono="text-neutro-grafito" />
          </div>
          <div className={`mt-3 pt-3 border-t-2 flex justify-between items-center ${r.aFavor ? 'border-positivo-600' : 'border-negativo-600'}`}>
            <span className={`font-bold uppercase ${r.aFavor ? 'text-positivo-700' : 'text-negativo-600'}`}>
              {r.aFavor ? 'Saldo a favor' : 'Saldo a cargo'}
            </span>
            <span className={`font-bold text-2xl font-mono tabular px-3 py-1 rounded ${r.aFavor ? 'text-positivo-700 bg-positivo-100' : 'text-negativo-600 bg-negativo-100'}`}>
              {moneda(Math.abs(r.saldo))}
            </span>
          </div>
          <p className="text-[10px] text-neutro-grafito mt-3">
            El subsidio para el empleo entregado en el año ya redujo las retenciones mensuales; no se vuelve a acreditar en el anual (Decreto DOF 31-12-2025).
          </p>
        </Tarjeta>
      </div>
      </div>
    </div>
  );
}
