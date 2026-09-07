/** Modelo de reporte fiscal reutilizable para impresión (PDF) y exportación CSV. */

export type Celda = string | number;

export interface SeccionReporte {
  titulo: string;
  /** Encabezados de columna (para tablas de varias columnas). */
  columnas?: string[];
  /** Cada fila: primera celda etiqueta (string); las demás, número (moneda) o texto. */
  filas: Celda[][];
}

export interface ReporteFiscal {
  titulo: string;
  subtitulo?: string;
  parametros: [string, Celda][];
  secciones: SeccionReporte[];
  totalEtiqueta?: string;
  totalValor?: number;
  /** Fundamentos normativos al pie. */
  fuentes?: string[];
  /** Nombre base del archivo CSV (sin extensión). */
  archivo: string;
}
