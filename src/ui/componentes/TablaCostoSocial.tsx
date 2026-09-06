import type { ResultadoNomina } from '../../motor/tipos';
import { moneda, porcentaje } from '../formato';

interface Props {
  resultado: ResultadoNomina;
  /** Versión compacta para impresión. */
  compacta?: boolean;
}

interface Fila {
  concepto: string;
  nota: string;
  patron: number;
  obrero: number;
  resaltar?: 'rt' | 'rcv' | 'infonavit';
}

export function filasCostoSocial(r: ResultadoNomina): Fila[] {
  const i = r.imss;
  return [
    { concepto: 'Cuota fija (EyM)', nota: '20.40 % UMA · sólo patrón (art. 106-I)', patron: i.cuotaFija.patron, obrero: 0 },
    { concepto: 'Excedente 3 UMA (EyM)', nota: '1.10 % / 0.40 % del excedente (art. 106-II)', patron: i.excedente.patron, obrero: i.excedente.obrero },
    { concepto: 'Prestaciones en dinero (EyM)', nota: '0.70 % / 0.25 % SBC (art. 107)', patron: i.prestacionesDinero.patron, obrero: i.prestacionesDinero.obrero },
    { concepto: 'Gastos médicos pensionados', nota: '1.05 % / 0.375 % SBC (art. 25)', patron: i.gastosMedicosPensionados.patron, obrero: i.gastosMedicosPensionados.obrero },
    { concepto: 'Riesgo de trabajo', nota: `Prima ${porcentaje(i.primaRiesgoAplicada, 5)} SBC (arts. 71-74)`, patron: i.riesgoTrabajo.patron, obrero: 0, resaltar: 'rt' },
    { concepto: 'Invalidez y vida', nota: '1.75 % / 0.625 % SBC (art. 147)', patron: i.invalidezVida.patron, obrero: i.invalidezVida.obrero },
    { concepto: 'Guarderías y prest. sociales', nota: '1.00 % SBC · sólo patrón (art. 211)', patron: i.guarderias.patron, obrero: 0 },
    { concepto: 'Retiro (SAR)', nota: '2.00 % SBC · sólo patrón (art. 168-I)', patron: i.retiro.patron, obrero: 0, resaltar: 'rcv' },
    { concepto: 'Cesantía en edad avanzada y vejez', nota: `Patrón ${porcentaje(i.pctCesantiaPatron, 3)} (${i.etiquetaCesantia}, col. 2026) / obrero 1.125 % (art. 168-II)`, patron: i.cesantiaVejez.patron, obrero: i.cesantiaVejez.obrero, resaltar: 'rcv' },
    { concepto: 'INFONAVIT', nota: '5 % SBC · aportación patronal (art. 29-II LINFONAVIT)', patron: i.infonavit.patron, obrero: 0, resaltar: 'infonavit' },
  ];
}

export default function TablaCostoSocial({ resultado: r, compacta = false }: Props) {
  const filas = filasCostoSocial(r);
  const sm = r.esSalarioMinimo;
  const px = compacta ? 'px-3' : 'px-6';
  const py = compacta ? 'py-1' : 'py-2';
  const texto = compacta ? 'text-[10px] md:text-xs' : 'text-sm';
  const totalObreroColumna = sm ? 0 : r.imss.totalImssObrero;

  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-left ${texto}`}>
        <thead className="bg-neutro-hueso text-neutro-grafito font-semibold border-b border-neutro-niebla">
          <tr>
            <th className={`${px} py-2`}>Rama del seguro</th>
            <th className={`${px} py-2 text-right text-azul-600`}>Patrón</th>
            <th className={`${px} py-2 text-right text-neutro-grafito`}>Obrero{sm ? ' (retenido)' : ''}</th>
            <th className={`${px} py-2 text-right text-azul-600`}>Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutro-arena text-neutro-grafito font-mono tabular">
          {filas.map((f) => {
            const obreroMostrado = sm ? 0 : f.obrero;
            const fondo = f.resaltar === 'rt' ? 'bg-ambar-100/50' : f.resaltar === 'rcv' ? 'bg-cian-100/50' : f.resaltar === 'infonavit' ? 'bg-acento-100/60 font-medium' : '';
            const borde = f.resaltar === 'rt' ? 'border-l-4 border-ambar-500' : f.resaltar === 'rcv' ? 'border-l-4 border-cian-500' : f.resaltar === 'infonavit' ? 'border-l-4 border-acento-600' : '';
            return (
              <tr key={f.concepto} className={fondo}>
                <td className={`${px} ${py} ${borde}`}>
                  <span className="block font-medium font-sans">{f.concepto}</span>
                  {!compacta && <span className="text-xs text-neutro-grafito font-sans">{f.nota}</span>}
                </td>
                <td className={`${px} ${py} text-right`}>{moneda(f.patron)}</td>
                <td className={`${px} ${py} text-right ${obreroMostrado === 0 ? 'text-neutro-grafito' : ''}`}>
                  {f.obrero === 0 ? '—' : moneda(obreroMostrado)}
                </td>
                <td className={`${px} ${py} text-right font-medium`}>{moneda(f.patron + obreroMostrado)}</td>
              </tr>
            );
          })}
          {sm && (
            <tr className="bg-positivo-100/70">
              <td className={`${px} ${py} border-l-4 border-positivo-600`}>
                <span className="block font-medium font-sans text-positivo-700">Cuota obrera absorbida por el patrón</span>
                {!compacta && <span className="text-xs text-positivo-700 font-sans">Art. 36 LSS: la cuota diaria es el salario mínimo; el patrón paga íntegramente la cuota del trabajador</span>}
              </td>
              <td className={`${px} ${py} text-right text-positivo-700 font-semibold`}>{moneda(r.cuotaObreraAbsorbida)}</td>
              <td className={`${px} ${py} text-right text-neutro-grafito`}>—</td>
              <td className={`${px} ${py} text-right font-semibold text-positivo-700`}>{moneda(r.cuotaObreraAbsorbida)}</td>
            </tr>
          )}
          <tr className="bg-azul-600 text-white font-bold">
            <td className={`${px} py-3`}>
              <span className="block uppercase tracking-wider text-xs font-sans">Costo social del periodo</span>
              {!compacta && <span className="text-[10px] font-normal text-azul-200 font-sans">IMSS patrón + INFONAVIT{sm ? ' + cuota obrera absorbida' : ''}</span>}
            </td>
            <td className={`${px} py-3 text-right`}>{moneda(r.costoSocialPatron)}</td>
            <td className={`${px} py-3 text-right text-azul-200`}>{moneda(totalObreroColumna)}</td>
            <td className={`${px} py-3 text-right text-cian-300`}>{moneda(r.costoSocialPatron + totalObreroColumna)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
