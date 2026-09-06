/** Formato de presentación. Aquí ocurre el único redondeo (a centavos) de toda la app. */

const fmtMoneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const seguro = (v: number) => (Number.isFinite(v) ? v : 0);

export const moneda = (v: number): string => fmtMoneda.format(seguro(v));

export const porcentaje = (fraccion: number, decimales = 3): string =>
  new Intl.NumberFormat('es-MX', {
    style: 'percent',
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(seguro(fraccion));

export const numero = (v: number, decimales = 2): string =>
  new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(seguro(v));

/** Cadena numérica con 2 decimales y punto decimal (para CSV). */
export const dec2 = (v: number): string => seguro(v).toFixed(2);

export const aNumero = (texto: string): number => {
  const n = parseFloat(texto.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};
