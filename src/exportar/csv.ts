import { ETIQUETA_JORNADA, ETIQUETA_MES, ETIQUETA_ZONA, FUENTES, VERSION_NORMATIVA } from '../motor/constantes2026';
import type { ResultadoNomina } from '../motor/tipos';
import { filasCostoSocial } from '../ui/componentes/TablaCostoSocial';
import { dec2 } from '../ui/formato';
import { MARCA } from '../ui/marca';

type Celda = string | number;

const esc = (c: Celda): string => {
  const s = typeof c === 'number' ? dec2(c) : String(c);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Construye el contenido CSV (UTF-8 con BOM, separador coma, 2 decimales). */
export function construirCSV(r: ResultadoNomina): string {
  const e = r.entrada;
  const filas: Celda[][] = [
    ['CALCULADORA NÓMINA 2026 Y CARGA SOCIAL — REPORTE DE CÁLCULO'],
    [MARCA.despacho],
    ['Elaborado por', MARCA.profesional],
    ['Contacto', MARCA.correo],
    ['Fecha de emisión', new Date().toLocaleDateString('es-MX')],
    ['Versión normativa', VERSION_NORMATIVA],
    [],
    ['PARÁMETROS'],
    ['Periodicidad', e.periodicidad],
    ['Días del periodo', r.dias],
    ['Mes de cálculo', ETIQUETA_MES[e.mes]],
    ['Zona económica', ETIQUETA_ZONA[e.zona]],
    ['Salario mínimo zona', r.salarioMinimo],
    ['UMA diaria', r.uma],
    ['UMA mensual', r.umaMensual],
    ['Cuota diaria', e.cuotaDiaria],
    ['Trabajador de salario mínimo', r.esSalarioMinimo ? 'Sí' : 'No'],
    ['Jornada', ETIQUETA_JORNADA[e.jornada]],
    ['Modo SBC', e.modoSBC === 'Antiguedad' ? 'Antigüedad (factor de integración)' : 'Manual'],
    ['Factor de integración aplicado', e.modoSBC === 'Antiguedad' ? r.sbc.factorAplicado.toFixed(4) : r.sbc.factorAplicado.toFixed(4) + ' (implícito)'],
    ['SBC bruto', r.sbc.sbcBruto],
    ['SBC de cotización (acotado)', r.sbc.sbcAcotado],
    ['Topado 25 UMA', r.sbc.topado25UMA ? 'Sí' : 'No'],
    ['Prima de riesgo de trabajo (%)', e.primaRiesgoPct],
    [],
    ['TIEMPO EXTRA Y DESCANSO TRABAJADO'],
    ['Semana', 'Horas capturadas', 'Horas dobles', 'Horas triples art. 68', 'Horas exceso', 'Días descanso', 'Pago dobles', 'Pago triples', 'Pago descanso', 'Exento', 'Gravado'],
    ...r.extras.semanas.map((s) => [
      s.numero,
      s.horasCapturadas,
      s.horasDentroLimite,
      s.horasArt68,
      s.horasExceso,
      s.diasDescansoTrabajados,
      s.pagoHorasDobles,
      s.pagoHorasTriples,
      s.pagoDescanso,
      s.exento,
      s.gravado,
    ]),
    ['Valor hora ordinaria', r.extras.valorHora],
    ['Total percepciones extra', r.extras.total],
    ['Exento art. 93-I LISR', r.extras.exento],
    ['Gravado', r.extras.gravado],
    [],
    ['LIQUIDACIÓN AL TRABAJADOR'],
    ['Sueldo ordinario', r.bruto],
    ['Percepciones extra', r.extras.total],
    ['Total percepciones', r.totalPercepciones],
    ['Base gravable ISR', r.baseGravable],
    ['Tarifa aplicada', r.isr.tarifaClave],
    ['Exento art. 96 LISR (salario mínimo)', r.isr.exentoArt96 ? 'Sí' : 'No'],
    ['ISR antes de subsidio', r.isr.isrAntesSubsidio],
    ['Subsidio mensual', r.subsidio.subsidioMensual],
    ['Subsidio del periodo', r.subsidio.subsidioPeriodo],
    ['Límite de ingresos del periodo', r.subsidio.limitePeriodo],
    ['Subsidio acreditado', r.subsidioAcreditado],
    ['ISR retenido', r.isrRetenido],
    ['IMSS obrero retenido', r.imssObreroRetenido],
    ['Cuota obrera absorbida por el patrón (art. 36 LSS)', r.cuotaObreraAbsorbida],
    ['Total deducciones', r.totalDeducciones],
    ['NETO A PAGAR', r.neto],
    [],
    ['COSTO SOCIAL — IMSS E INFONAVIT'],
    ['Rama', 'Patrón', 'Obrero', 'Total'],
    ...filasCostoSocial(r).map((f) => [f.concepto, f.patron, f.obrero, f.patron + f.obrero]),
    ['Total IMSS patrón', r.imss.totalImssPatron],
    ['Total IMSS obrero (determinado)', r.imss.totalImssObrero],
    ['INFONAVIT', r.imss.totalInfonavit],
    ['Cuota obrera absorbida (art. 36 LSS)', r.cuotaObreraAbsorbida],
    ['Costo social patrón', r.costoSocialPatron],
    ['COSTO TOTAL EMPRESA', r.costoTotalEmpresa],
    [],
    ['AVISOS'],
    ...(r.avisos.length ? r.avisos.map((a) => [a.nivel, a.mensaje]) : [['—', 'Sin avisos']]),
    [],
    ['LEYENDAS NORMATIVAS'],
    ...r.leyendas.map((l) => [l.ambito, l.titulo, l.texto, l.fundamento]),
    [],
    ['FUENTES'],
    ...FUENTES.map((f) => [f]),
    [],
    ['AVISO LEGAL'],
    [MARCA.leyenda],
    [MARCA.atribucionFooter],
  ];
  return '﻿' + filas.map((f) => f.map(esc).join(',')).join('\r\n');
}

export function exportarCSV(r: ResultadoNomina): void {
  const blob = new Blob([construirCSV(r)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Nomina2026_${r.entrada.periodicidad}_${r.entrada.mes === 'Enero' ? 'Ene' : 'FebDic'}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
