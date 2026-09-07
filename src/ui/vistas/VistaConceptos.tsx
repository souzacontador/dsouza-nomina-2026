import { Gift } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ETIQUETA_MES, UMA_DIARIA } from '../../motor/constantes2026';
import { calcularConceptosAnuales } from '../../motor/conceptosAnuales';
import type { MesCalculo } from '../../motor/tipos';
import { Campo, Renglon, Tarjeta } from '../componentes/Campo';
import { moneda, porcentaje } from '../formato';

export default function VistaConceptos() {
  const [cuotaDiaria, setCuota] = useState(500);
  const [mes, setMes] = useState<MesCalculo>('Resto');
  const [aguinaldoDias, setAguinaldoDias] = useState(15);
  const [diasTrabajadosAnio, setDiasAnio] = useState(365);
  const [diasVacaciones, setDiasVac] = useState(12);
  const [ptuMonto, setPtu] = useState(0);
  const [domingosLaborados, setDomingos] = useState(0);

  const r = useMemo(
    () => calcularConceptosAnuales({ cuotaDiaria, uma: UMA_DIARIA[mes], aguinaldoDias, diasTrabajadosAnio, diasVacaciones, ptuMonto, domingosLaborados }),
    [cuotaDiaria, mes, aguinaldoDias, diasTrabajadosAnio, diasVacaciones, ptuMonto, domingosLaborados],
  );

  const concepto = (nombre: string, c: { monto: number; exento: number; gravado: number }) =>
    c.monto > 0 ? (
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 text-sm py-1.5 border-b border-neutro-arena">
        <span className="text-neutro-grafito">{nombre}</span>
        <span className="font-mono tabular text-azul-600">{moneda(c.monto)}</span>
        <span className="font-mono tabular text-positivo-700">{moneda(c.exento)}</span>
        <span className="font-mono tabular text-negativo-600">{moneda(c.gravado)}</span>
      </div>
    ) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 space-y-6">
        <Tarjeta titulo="Aguinaldo, prima vacacional y PTU" icono={<Gift className="w-4 h-4 text-cian-600" />}>
          <div className="grid grid-cols-2 gap-4">
            <Campo label="Cuota diaria" value={cuotaDiaria} onValue={setCuota} />
            <label className="block">
              <span className="block text-sm font-medium text-neutro-grafito mb-1">Mes (UMA)</span>
              <select value={mes} onChange={(e) => setMes(e.target.value as MesCalculo)} className="block w-full py-2 px-2 text-sm border border-neutro-niebla rounded-lg bg-white focus:ring-2 focus:ring-cian-500">
                {(Object.keys(ETIQUETA_MES) as MesCalculo[]).map((m) => <option key={m} value={m}>{ETIQUETA_MES[m]}</option>)}
              </select>
            </label>
            <Campo label="Días de aguinaldo" value={aguinaldoDias} onValue={setAguinaldoDias} prefijo="" step="1" nota="Mínimo 15 (art. 87 LFT)" />
            <Campo label="Días trabajados en el año" value={diasTrabajadosAnio} onValue={setDiasAnio} prefijo="" step="1" nota="Para el aguinaldo proporcional" />
            <Campo label="Días de vacaciones" value={diasVacaciones} onValue={setDiasVac} prefijo="" step="1" nota="Base de la prima vacacional (art. 76)" />
            <Campo label="Domingos laborados" value={domingosLaborados} onValue={setDomingos} prefijo="" step="1" nota="Prima dominical (opcional)" />
            <Campo label="PTU asignada" value={ptuMonto} onValue={setPtu} nota="Monto del reparto de utilidades" />
          </div>
        </Tarjeta>
      </div>

      <div className="lg:col-span-7 space-y-6">
        <Tarjeta titulo="Resultado" icono={<Gift className="w-4 h-4 text-cian-600" />}>
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 text-[11px] font-semibold uppercase tracking-wide text-neutro-grafito border-b border-neutro-niebla pb-1">
            <span>Concepto</span><span className="text-right">Monto</span><span className="text-right">Exento</span><span className="text-right">Gravado</span>
          </div>
          {concepto('Aguinaldo', r.aguinaldo)}
          {concepto('Prima vacacional', r.primaVacacional)}
          {concepto('PTU', r.ptu)}
          {concepto('Prima dominical', r.primaDominical)}
          <div className="mt-4 space-y-1">
            <Renglon k="Total percepciones" v={r.totalPercepciones} fuerte />
            <Renglon k="Total exento (art. 93-XIV LISR)" v={r.totalExento} tono="text-positivo-700" />
            <Renglon k="Total gravado" v={r.totalGravado} tono="text-negativo-600" />
            <Renglon k="ISR por retener" sub={`Método art. 174 RLISR · tasa ${porcentaje(r.tasaArt174, 4)} · sueldo mensual ordinario ${moneda(r.sueldoMensualOrdinario)}`} v={r.isr} tono="text-negativo-600" />
          </div>
          <div className="mt-3 pt-3 border-t-2 border-azul-600 flex justify-between items-center">
            <span className="font-bold text-azul-600 uppercase">Neto a pagar</span>
            <span className="font-bold text-2xl text-azul-600 font-mono tabular bg-cian-100 px-3 py-1 rounded">{moneda(r.neto)}</span>
          </div>
        </Tarjeta>
      </div>
    </div>
  );
}
