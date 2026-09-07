import { FileMinus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ETIQUETA_MES, ETIQUETA_ZONA, EXENCIONES_93, METODO_ISR, SEPARACION_LFT, UMA_DIARIA } from '../../motor/constantes2026';
import { calcularFiniquito, type MotivoSeparacion } from '../../motor/finiquito';
import type { MesCalculo, Zona } from '../../motor/tipos';
import type { Celda, ReporteFiscal } from '../../exportar/documento';
import AccionesExport from '../componentes/AccionesExport';
import { Campo, Renglon, Tarjeta } from '../componentes/Campo';
import { moneda, porcentaje } from '../formato';

const MOTIVOS: { v: MotivoSeparacion; label: string }[] = [
  { v: 'despido', label: 'Despido injustificado' },
  { v: 'renuncia', label: 'Renuncia voluntaria' },
  { v: 'mutuo', label: 'Mutuo acuerdo' },
];

export default function VistaFiniquito() {
  const [cuotaDiaria, setCuota] = useState(500);
  const [mes, setMes] = useState<MesCalculo>('Resto');
  const [zona, setZona] = useState<Zona>('General');
  const [motivo, setMotivo] = useState<MotivoSeparacion>('despido');
  const [anios, setAnios] = useState(3);
  const [diasTrabajadosAnio, setDiasAnio] = useState(365);
  const [diasVacacionesPendientes, setVac] = useState(6);

  const r = useMemo(
    () => calcularFiniquito({ cuotaDiaria, uma: UMA_DIARIA[mes], zona, motivo, anios, diasTrabajadosAnio, diasVacacionesPendientes }),
    [cuotaDiaria, mes, zona, motivo, anios, diasTrabajadosAnio, diasVacacionesPendientes],
  );

  const fila = (nombre: string, sub: string, c: { monto: number; exento: number; gravado: number }) =>
    c.monto > 0 ? (
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 text-sm py-1.5 border-b border-neutro-arena">
        <span className="text-neutro-grafito">{nombre}<span className="block text-[10px] text-neutro-grafito/80">{sub}</span></span>
        <span className="font-mono tabular text-azul-600 self-start">{moneda(c.monto)}</span>
        <span className="font-mono tabular text-positivo-700 self-start">{moneda(c.exento)}</span>
        <span className="font-mono tabular text-negativo-600 self-start">{moneda(c.gravado)}</span>
      </div>
    ) : null;

  const reporte = (): ReporteFiscal => {
    const fil = (n: string, c: { monto: number; exento: number; gravado: number }): Celda[] | null =>
      c.monto > 0 ? [n, c.monto, c.exento, c.gravado] : null;
    const filas = [
      fil('Aguinaldo proporcional', r.aguinaldo),
      fil('Vacaciones no gozadas', r.vacaciones),
      fil('Prima vacacional', r.primaVacacional),
      fil('3 meses de indemnización', r.tresMeses),
      fil('20 días por año', r.veinteDiasPorAnio),
      fil('Prima de antigüedad', r.primaAntiguedad),
    ].filter((x): x is Celda[] => x !== null);
    return {
      titulo: motivo === 'despido' ? 'Liquidación por despido injustificado' : 'Finiquito',
      archivo: `Finiquito_${motivo}_2026`,
      parametros: [
        ['Motivo', MOTIVOS.find((m) => m.v === motivo)?.label ?? motivo],
        ['Cuota diaria', cuotaDiaria],
        ['Años de servicio', anios],
        ['Zona', ETIQUETA_ZONA[zona]],
        ['Mes (UMA)', ETIQUETA_MES[mes]],
        ['Vacaciones pendientes (días)', diasVacacionesPendientes],
      ],
      secciones: [
        { titulo: 'Percepciones (monto / exento / gravado)', columnas: ['Concepto', 'Monto', 'Exento', 'Gravado'], filas },
        {
          titulo: 'Impuesto y totales',
          filas: [
            ['Total percepciones', r.totalPercepciones],
            ['Total exento', r.totalExento],
            ['ISR proporcionales (art. 174 RLISR)', r.isrOrdinario],
            [`ISR separación (art. 95, tasa ${porcentaje(r.tasaSeparacion, 4)})`, r.isrSeparacion],
            ['ISR total', r.isrTotal],
          ],
        },
      ],
      totalEtiqueta: 'Neto a pagar',
      totalValor: r.neto,
      fuentes: [SEPARACION_LFT.fuente, EXENCIONES_93.fuente, METODO_ISR.fuenteArt174, METODO_ISR.fuenteArt95],
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="font-serif text-lg font-bold text-azul-600">{motivo === 'despido' ? 'Liquidación' : 'Finiquito'}</h2>
        <AccionesExport construir={reporte} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 space-y-6">
        <Tarjeta titulo="Datos de la separación" icono={<FileMinus className="w-4 h-4 text-cian-600" />} filete="acento">
          <div className="grid grid-cols-2 gap-4">
            <label className="block col-span-2">
              <span className="block text-sm font-medium text-neutro-grafito mb-1">Motivo</span>
              <select value={motivo} onChange={(e) => setMotivo(e.target.value as MotivoSeparacion)} className="block w-full py-2 px-2 text-sm border border-neutro-niebla rounded-lg bg-white focus:ring-2 focus:ring-cian-500">
                {MOTIVOS.map((m) => <option key={m.v} value={m.v}>{m.label}</option>)}
              </select>
            </label>
            <Campo label="Cuota diaria" value={cuotaDiaria} onValue={setCuota} />
            <Campo label="Años de servicio" value={anios} onValue={setAnios} prefijo="" step="0.5" nota="Admite fracción (p. ej. 3.5)" />
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
            <Campo label="Días trabajados en el año" value={diasTrabajadosAnio} onValue={setDiasAnio} prefijo="" step="1" nota="Aguinaldo proporcional" />
            <Campo label="Vacaciones pendientes (días)" value={diasVacacionesPendientes} onValue={setVac} prefijo="" step="1" nota="No gozadas" />
          </div>
          <p className="text-[10px] text-neutro-grafito mt-3">No incluye salarios vencidos ni intereses (art. 48, litigio) ni cuotas IMSS del finiquito (se determinan en el SUA de la baja).</p>
        </Tarjeta>
      </div>

      <div className="lg:col-span-7 space-y-6">
        <Tarjeta titulo={motivo === 'despido' ? 'Liquidación' : 'Finiquito'} icono={<FileMinus className="w-4 h-4 text-cian-600" />} filete="acento">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 text-[11px] font-semibold uppercase tracking-wide text-neutro-grafito border-b border-neutro-niebla pb-1">
            <span>Concepto</span><span className="text-right">Monto</span><span className="text-right">Exento</span><span className="text-right">Gravado</span>
          </div>
          <div className="text-[10px] uppercase tracking-wider text-neutro-grafito font-bold pt-2">Partes proporcionales (finiquito)</div>
          {fila('Aguinaldo proporcional', 'Art. 87 LFT · exención 30 UMA', r.aguinaldo)}
          {fila('Vacaciones no gozadas', 'Salario ordinario', r.vacaciones)}
          {fila('Prima vacacional', 'Art. 80 · exención 15 UMA', r.primaVacacional)}
          {(r.aplicaIndemnizacion || r.aplicaPrimaAntiguedad) && (
            <div className="text-[10px] uppercase tracking-wider text-neutro-grafito font-bold pt-3">Separación (exención 90 UMA/año, art. 93-XIII)</div>
          )}
          {fila('3 meses de indemnización', 'Art. 48 / 50-III', r.tresMeses)}
          {fila('20 días por año', 'Art. 50-II', r.veinteDiasPorAnio)}
          {fila('Prima de antigüedad', 'Art. 162 · tope 2 SM', r.primaAntiguedad)}

          <div className="mt-4 space-y-1">
            <Renglon k="Total percepciones" v={r.totalPercepciones} fuerte />
            <Renglon k="Total exento" v={r.totalExento} tono="text-positivo-700" />
            <Renglon k="ISR proporcionales (art. 174 RLISR)" v={r.isrOrdinario} tono="text-negativo-600" />
            <Renglon k="ISR separación (art. 95 LISR)" sub={r.tasaSeparacion > 0 ? `Tasa efectiva ${porcentaje(r.tasaSeparacion, 4)}` : undefined} v={r.isrSeparacion} tono="text-negativo-600" />
          </div>
          <div className="mt-3 pt-3 border-t-2 border-azul-600 flex justify-between items-center">
            <span className="font-bold text-azul-600 uppercase">Neto a pagar</span>
            <span className="font-bold text-2xl text-azul-600 font-mono tabular bg-cian-100 px-3 py-1 rounded">{moneda(r.neto)}</span>
          </div>
        </Tarjeta>
      </div>
      </div>
    </div>
  );
}
