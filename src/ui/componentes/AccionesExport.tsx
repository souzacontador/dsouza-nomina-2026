import { FileSpreadsheet, Printer } from 'lucide-react';
import { useState } from 'react';
import { exportarReporteCSV } from '../../exportar/csvGenerico';
import type { ReporteFiscal } from '../../exportar/documento';
import HojaImpresion from './HojaImpresion';

/** Barra de acciones PDF/CSV para las herramientas fiscales. `construir` arma el reporte al vuelo. */
export default function AccionesExport({ construir }: { construir: () => ReporteFiscal }) {
  const [imprimir, setImprimir] = useState(false);
  return (
    <>
      <div className="flex gap-2 no-print">
        <button type="button" onClick={() => setImprimir(true)} className="flex items-center gap-2 bg-azul-600 hover:bg-azul-700 text-white px-3 py-2 rounded-lg shadow-sm transition-all font-medium text-sm focus:outline-none focus:ring-2 focus:ring-azul-400">
          <Printer className="w-4 h-4" /> PDF
        </button>
        <button type="button" onClick={() => exportarReporteCSV(construir())} className="flex items-center gap-2 bg-cian-600 hover:bg-cian-700 text-azul-900 px-3 py-2 rounded-lg shadow-sm transition-all font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-cian-400">
          <FileSpreadsheet className="w-4 h-4" /> CSV
        </button>
      </div>
      {imprimir && <HojaImpresion reporte={construir()} onClose={() => setImprimir(false)} />}
    </>
  );
}
