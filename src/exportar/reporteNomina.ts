import { ETIQUETA_JORNADA, ETIQUETA_MES, ETIQUETA_ZONA } from '../motor/constantes2026';
import type { ResultadoNomina } from '../motor/tipos';
import { filasCostoSocial } from '../ui/componentes/TablaCostoSocial';
import type { Celda, ReporteFiscal } from './documento';

/** Construye un ReporteFiscal a partir del resultado de nómina (para CSV/Excel). */
export function reporteNomina(r: ResultadoNomina): ReporteFiscal {
  const e = r.entrada;
  const percepciones: Celda[][] = [['Sueldo ordinario', r.bruto]];
  if (r.extras.total > 0) {
    percepciones.push(['Tiempo extra y descanso (exento)', r.extras.exento]);
    percepciones.push(['Tiempo extra y descanso (gravado)', r.extras.gravado]);
  }
  percepciones.push(['Total percepciones', r.totalPercepciones]);

  const deducciones: Celda[][] = [
    ['ISR antes de subsidio', r.isr.isrAntesSubsidio],
    ['Subsidio para el empleo acreditado', r.subsidioAcreditado],
    ['ISR retenido', r.isrRetenido],
    ['IMSS obrero retenido', r.imssObreroRetenido],
  ];
  if (r.esSalarioMinimo) deducciones.push(['Cuota obrera absorbida por el patrón (art. 36 LSS)', r.cuotaObreraAbsorbida]);
  deducciones.push(['Total deducciones', r.totalDeducciones]);

  const costo: Celda[][] = filasCostoSocial(r).map((f) => [f.concepto, f.patron, f.obrero, f.patron + f.obrero]);
  costo.push(['Total IMSS patrón', r.imss.totalImssPatron, '', '']);
  costo.push(['INFONAVIT', r.imss.totalInfonavit, '', '']);
  costo.push(['Costo social patrón', r.costoSocialPatron, '', '']);
  costo.push(['Costo total empresa', r.costoTotalEmpresa, '', '']);

  return {
    titulo: 'Recibo de nómina 2026',
    archivo: `Nomina2026_${e.periodicidad}_${e.mes === 'Enero' ? 'Ene' : 'FebDic'}`,
    parametros: [
      ['Periodicidad', `${e.periodicidad} (${r.dias} días)`],
      ['Mes', ETIQUETA_MES[e.mes]],
      ['Zona', ETIQUETA_ZONA[e.zona]],
      ['Cuota diaria', e.cuotaDiaria],
      ['Jornada', ETIQUETA_JORNADA[e.jornada]],
      ['SBC de cotización', r.sbc.sbcAcotado],
      ['Salario mínimo', r.esSalarioMinimo ? 'Sí' : 'No'],
    ],
    secciones: [
      { titulo: 'Percepciones', filas: percepciones },
      { titulo: 'Deducciones', filas: deducciones },
      { titulo: 'Costo social (IMSS e INFONAVIT)', columnas: ['Rama', 'Patrón', 'Obrero', 'Total'], filas: costo },
    ],
    totalEtiqueta: 'Neto a pagar',
    totalValor: r.neto,
  };
}
