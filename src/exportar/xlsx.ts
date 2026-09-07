import * as XLSX from 'xlsx';
import { VERSION_NORMATIVA } from '../motor/constantes2026';
import { MARCA } from '../ui/marca';
import { descargarArchivo } from './descargar';
import type { Celda, ReporteFiscal } from './documento';

/** Formato de moneda MXN para celdas numéricas del Excel. */
const FMT_MONEDA = '"$"#,##0.00';

/** Aplana un ReporteFiscal a filas (array de arrays) para la hoja de cálculo. */
function reporteAFilas(r: ReporteFiscal): Celda[][] {
  const filas: Celda[][] = [
    [r.titulo],
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
    filas.push([], [s.titulo]);
    if (s.columnas) filas.push(s.columnas);
    filas.push(...s.filas);
  }
  if (r.totalEtiqueta !== undefined && r.totalValor !== undefined) {
    filas.push([], [r.totalEtiqueta, r.totalValor]);
  }
  if (r.fuentes?.length) filas.push([], ['FUENTES'], ...r.fuentes.map((f) => [f]));
  filas.push([], ['AVISO LEGAL'], [MARCA.leyenda], [MARCA.atribucionFooter]);
  return filas;
}

/** Genera el .xlsx (con formato de moneda y anchos de columna) y lo descarga. */
export function exportarReporteXLSX(r: ReporteFiscal): Promise<{ ok: boolean; motivo?: string }> {
  const filas = reporteAFilas(r);
  const ws = XLSX.utils.aoa_to_sheet(filas);

  // Formato de moneda a toda celda numérica (excepto parámetros que no son montos se ven igual).
  const rango = XLSX.utils.decode_range(ws['!ref'] as string);
  for (let R = rango.s.r; R <= rango.e.r; R++) {
    for (let C = rango.s.c; C <= rango.e.c; C++) {
      const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
      if (cell && cell.t === 'n' && C > 0) {
        cell.z = FMT_MONEDA;
      }
    }
  }
  // Anchos de columna legibles.
  ws['!cols'] = [{ wch: 42 }, { wch: 16 }, { wch: 16 }, { wch: 16 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Cálculo');
  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
  return descargarArchivo(
    `${r.archivo}.xlsx`,
    buf,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
}
