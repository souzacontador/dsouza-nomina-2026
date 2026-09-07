import { VERSION_NORMATIVA } from '../motor/constantes2026';
import { MARCA } from '../ui/marca';
import { dec2 } from '../ui/formato';
import type { Celda, ReporteFiscal } from './documento';

const esc = (c: Celda): string => {
  const s = typeof c === 'number' ? dec2(c) : String(c);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** CSV con marca (BOM UTF-8, coma, 2 decimales) a partir de un ReporteFiscal. */
export function construirCSVGenerico(r: ReporteFiscal): string {
  const filas: Celda[][] = [
    [r.titulo.toUpperCase()],
    [MARCA.despacho],
    ['Elaborado por', MARCA.profesional],
    ['Contacto', MARCA.correo],
    ['Fecha de emisión', new Date().toLocaleDateString('es-MX')],
    ['Versión normativa', VERSION_NORMATIVA],
    [],
    ['PARÁMETROS'],
    ...r.parametros,
  ];
  for (const s of r.secciones) {
    filas.push([], [s.titulo.toUpperCase()]);
    if (s.columnas) filas.push(s.columnas);
    filas.push(...s.filas);
  }
  if (r.totalEtiqueta !== undefined && r.totalValor !== undefined) {
    filas.push([], [r.totalEtiqueta.toUpperCase(), r.totalValor]);
  }
  if (r.fuentes?.length) {
    filas.push([], ['FUENTES'], ...r.fuentes.map((f) => [f]));
  }
  filas.push([], ['AVISO LEGAL'], [MARCA.leyenda], [MARCA.atribucionFooter]);
  return '﻿' + filas.map((f) => f.map(esc).join(',')).join('\r\n');
}

export function exportarReporteCSV(r: ReporteFiscal): void {
  const blob = new Blob([construirCSVGenerico(r)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${r.archivo}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
