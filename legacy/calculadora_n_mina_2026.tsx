import React, { useState, useMemo } from 'react';
import { Calculator, DollarSign, Info, ChevronDown, ChevronUp, Briefcase, UserCheck, ShieldCheck, PieChart, FileSpreadsheet, Printer, ArrowLeft, FileText, AlertTriangle, Command } from 'lucide-react';

// --- CONSTANTES Y DATOS 2026 ---

const PERIODOS = {
  Semanal: { dias: 7, label: "Semanal (7 días)" },
  Catorcenal: { dias: 14, label: "Catorcenal (14 días)" },
  Quincenal: { dias: 15, label: "Quincenal (15 días)" },
  Mensual: { dias: 30.4, label: "Mensual (30.4 días)" }
};

const TABLA_ISR_2026 = [
  { limInf: 0.01, cuota: 0.00, pct: 0.0192 },
  { limInf: 844.60, cuota: 16.22, pct: 0.0640 },
  { limInf: 7168.52, cuota: 420.95, pct: 0.1088 },
  { limInf: 12598.03, cuota: 1011.68, pct: 0.1600 },
  { limInf: 14644.65, cuota: 1339.14, pct: 0.1792 },
  { limInf: 17533.65, cuota: 1856.84, pct: 0.2136 },
  { limInf: 35362.84, cuota: 5665.16, pct: 0.2352 },
  { limInf: 55736.69, cuota: 10457.09, pct: 0.3000 },
  { limInf: 106410.51, cuota: 25659.23, pct: 0.3200 },
  { limInf: 141880.67, cuota: 37009.69, pct: 0.3400 },
  { limInf: 425642.00, cuota: 133488.54, pct: 0.3500 }
];

const FACTORES_INTEGRACION = [
  { label: "1 año (Nuevo Ingreso)", valor: 1.0493, vac: 12 },
  { label: "2 años", valor: 1.0507, vac: 14 },
  { label: "3 años", valor: 1.0521, vac: 16 },
  { label: "4 años", valor: 1.0534, vac: 18 },
  { label: "5 años", valor: 1.0548, vac: 20 },
  { label: "6 a 10 años", valor: 1.0562, vac: 22 },
  { label: "11 a 15 años", valor: 1.0575, vac: 24 },
  { label: "16 a 20 años", valor: 1.0589, vac: 26 },
  { label: "21 a 25 años", valor: 1.0603, vac: 28 },
  { label: "26 a 30 años", valor: 1.0616, vac: 30 },
  { label: "31 a 35 años", valor: 1.0630, vac: 32 }
];

const getPorcentajeCesantiaPatronal = (sbc, sm, uma) => {
    if (sbc <= sm * 1.01) return 0.03150; 
    const vecesUma = sbc / uma;
    if (vecesUma <= 1.01) return 0.03150;
    if (vecesUma <= 1.50) return 0.03281;
    if (vecesUma <= 2.00) return 0.04202;
    if (vecesUma <= 2.50) return 0.06556;
    if (vecesUma <= 3.00) return 0.07962;
    if (vecesUma <= 3.50) return 0.09368;
    if (vecesUma <= 4.00) return 0.10774;
    return 0.11875;
};

export default function App() {
  const [cuotaDiaria, setCuotaDiaria] = useState(500); 
  const [periodo, setPeriodo] = useState("Quincenal");
  const [zona, setZona] = useState("General");
  const [mes, setMes] = useState("Resto"); 
  
  const [usarSbcCalculado, setUsarSbcCalculado] = useState(true);
  const [factorIdx, setFactorIdx] = useState(0); 
  const [sbcManual, setSbcManual] = useState(524.65);
  const [primaRiesgo, setPrimaRiesgo] = useState(0.50000); 
  
  // Estado para controlar la vista (App vs Print Preview)
  const [viewMode, setViewMode] = useState('app'); // 'app' | 'print'
  
  const [showDetails, setShowDetails] = useState(false);
  const [showImssDetails, setShowImssDetails] = useState(true);

  const valoresOficiales = useMemo(() => {
    const UMA = mes === "Enero" ? 113.14 : 117.31;
    const SM = zona === "Frontera" ? 440.87 : 315.04;
    return { UMA, SM };
  }, [mes, zona]);

  const resultado = useMemo(() => {
    const dias = PERIODOS[periodo].dias;
    const { UMA, SM } = valoresOficiales;

    const ingresoPeriodo = cuotaDiaria * dias;
    const factorMes = 30.4 / dias;
    const ingresoMensualBase = ingresoPeriodo * factorMes;

    let isrMensual = 0;
    let subsidioMensual = 0;
    let esExento = false;
    const umaMensual = UMA * 30.4;
    const smMensual = SM * 30.4;

    if (ingresoMensualBase <= smMensual + 1.0) {
      isrMensual = 0;
      esExento = true;
    } else {
      let rangoAplicable = null;
      for (let i = TABLA_ISR_2026.length - 1; i >= 0; i--) {
        if (ingresoMensualBase >= TABLA_ISR_2026[i].limInf) {
          rangoAplicable = TABLA_ISR_2026[i];
          break;
        }
      }
      if (rangoAplicable) {
        const excedente = ingresoMensualBase - rangoAplicable.limInf;
        isrMensual = (excedente * rangoAplicable.pct) + rangoAplicable.cuota;
      }
      if (ingresoMensualBase <= 10171.00) {
        subsidioMensual = umaMensual * 0.138;
      }
      isrMensual = Math.max(0, isrMensual - subsidioMensual);
    }
    const isrPeriodo = isrMensual / factorMes;

    let sbcFinal = usarSbcCalculado 
        ? cuotaDiaria * FACTORES_INTEGRACION[factorIdx].valor 
        : sbcManual;
    let factorUtilizado = usarSbcCalculado ? FACTORES_INTEGRACION[factorIdx].valor : (sbcManual / (cuotaDiaria || 1));

    let sbcAcotado = Math.max(SM, Math.min(sbcFinal, 25 * UMA));

    // CÁLCULO DETALLADO COP
    const cuotaFijaPatron = UMA * dias * 0.2040;
    const baseExcedente = Math.max(0, sbcAcotado - (3 * UMA));
    const excPatron = baseExcedente * dias * 0.0110;
    const excObrero = baseExcedente * dias * 0.0040;
    const pdPatron = sbcAcotado * dias * 0.0070;
    const pdObrero = sbcAcotado * dias * 0.0025;
    const gmpPatron = sbcAcotado * dias * 0.0105;
    const gmpObrero = sbcAcotado * dias * 0.00375;
    const rtPatron = sbcAcotado * dias * (primaRiesgo / 100);
    const ivPatron = sbcAcotado * dias * 0.0175;
    const ivObrero = sbcAcotado * dias * 0.00625;
    const gypsPatron = sbcAcotado * dias * 0.0100;
    const retiroPatron = sbcAcotado * dias * 0.0200;
    const pctCesantiaPatron = getPorcentajeCesantiaPatronal(sbcAcotado, SM, UMA);
    const cvPatron = sbcAcotado * dias * pctCesantiaPatron;
    const cvObrero = sbcAcotado * dias * 0.01125;
    const infonavitPatron = sbcAcotado * dias * 0.0500;

    const totalImssPatron = cuotaFijaPatron + excPatron + pdPatron + gmpPatron + rtPatron + ivPatron + gypsPatron + retiroPatron + cvPatron;
    const totalImssObrero = excObrero + pdObrero + gmpObrero + ivObrero + cvObrero;
    const totalInfonavit = infonavitPatron;
    const neto = ingresoPeriodo - isrPeriodo - totalImssObrero;

    return {
      bruto: ingresoPeriodo,
      dias,
      baseMensual: ingresoMensualBase,
      isrMensualTeorico: isrMensual + subsidioMensual,
      subsidioMensual,
      isrPeriodo,
      imssObrero: totalImssObrero,
      imssPatron: totalImssPatron,
      infonavit: totalInfonavit,
      costoSocialTotal: totalImssPatron + totalInfonavit,
      costoTotalEmpresa: ingresoPeriodo + totalImssPatron + totalInfonavit,
      neto,
      esExento,
      sbc: sbcAcotado,
      factorAplicado: factorUtilizado,
      breakdown: {
        cuotaFija: cuotaFijaPatron,
        excedente: { patron: excPatron, obrero: excObrero },
        prestaciones: { patron: pdPatron, obrero: pdObrero },
        gmp: { patron: gmpPatron, obrero: gmpObrero },
        rt: rtPatron,
        iv: { patron: ivPatron, obrero: ivObrero },
        guarderias: gypsPatron,
        retiro: retiroPatron,
        cesantia: { patron: cvPatron, obrero: cvObrero, pctPatron: pctCesantiaPatron },
        infonavit: infonavitPatron
      }
    };

  }, [cuotaDiaria, periodo, valoresOficiales, usarSbcCalculado, factorIdx, sbcManual, primaRiesgo]);

  const f = (val) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
  const fp = (val) => new Intl.NumberFormat('es-MX', { style: 'percent', minimumFractionDigits: 3 }).format(val);

  // --- ACTIONS ---
  const handleExportCSV = () => {
    const rows = [
      ["CALCULADORA NÓMINA 2026 Y CARGA SOCIAL - REPORTE DE CÁLCULO"],
      ["Generado por:", "C.P. Daniel Souza"],
      [""],
      ["LIQUIDACION AL TRABAJADOR"],
      ["Ingreso Bruto", resultado.bruto.toFixed(2)],
      ["Neto a Pagar", resultado.neto.toFixed(2)],
      [""],
      ["COSTO TOTAL EMPRESA", resultado.costoTotalEmpresa.toFixed(2)]
    ];
    const csvContent = "\ufeff" + rows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Nomina_${periodo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const togglePrintView = () => {
    setViewMode('print');
  };

  const executePrint = () => {
    window.print();
  };

  // --- VISTA DE IMPRESIÓN (Separada para garantizar renderizado) ---
  if (viewMode === 'print') {
    return (
      <div className="bg-slate-200 min-h-screen p-8 flex flex-col items-center">
        
        {/* CSS GLOBAL FORZADO PARA IMPRESIÓN */}
        <style dangerouslySetInnerHTML={{__html: `
            @media print {
                @page { margin: 0.8cm; size: letter portrait; }
                body { background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                /* Ocultar barra de herramientas */
                .print-toolbar { display: none !important; }
                /* Asegurar hoja visible */
                .print-sheet {
                    box-shadow: none !important;
                    width: 100% !important;
                    max-width: none !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
            }
        `}} />

        {/* Barra de Herramientas (Visible solo en pantalla de preview) */}
        <div className="print-toolbar w-full max-w-[21.59cm] mb-6 flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-lg gap-4">
            <button 
                onClick={() => setViewMode('app')}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
                <ArrowLeft className="w-5 h-5" /> Volver a Editar
            </button>
            
            <div className="flex flex-col items-center md:items-end gap-1">
                <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-4 py-2 rounded-lg border border-blue-200 shadow-sm animate-pulse">
                    <Command className="w-5 h-5" />
                    <span className="font-bold text-sm">Para Guardar PDF: Presiona Ctrl + P (o Cmd + P)</span>
                </div>
                <button 
                    onClick={executePrint}
                    className="text-xs text-slate-400 hover:text-slate-600 underline mt-1"
                >
                    (O intentar impresión automática aquí)
                </button>
            </div>
        </div>

        {/* --- HOJA DE PAPEL (A4/Carta) --- */}
        <div className="print-sheet bg-white shadow-2xl w-full max-w-[21.59cm] min-h-[27.94cm] p-[1.5cm]">
            
            {/* HEADER DOC */}
            <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">CALCULADORA NÓMINA 2026 Y CARGA SOCIAL</h1>
                    <p className="text-sm text-slate-500 mt-1">Determinación de Impuestos y Cuotas Obrero-Patronales</p>
                </div>
                <div className="text-right text-xs text-slate-600">
                    <p className="font-bold text-slate-900">Elaborado por: C.P. Daniel Souza</p>
                    <p>Fecha de Emisión: {new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* 1. DATOS DEL CÁLCULO */}
            <div className="mb-6 border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 font-bold text-xs text-slate-700 uppercase">Parámetros Generales</div>
                <div className="grid grid-cols-4 gap-4 p-4 text-xs">
                    <div>
                        <span className="block text-slate-500 mb-1">Periodo</span>
                        <span className="font-bold text-slate-900">{periodo} ({resultado.dias} días)</span>
                    </div>
                    <div>
                        <span className="block text-slate-500 mb-1">Zona Económica</span>
                        <span className="font-bold text-slate-900">{zona === "General" ? "Resto del País" : "ZLFN"}</span>
                    </div>
                    <div>
                        <span className="block text-slate-500 mb-1">Cuota Diaria</span>
                        <span className="font-bold text-slate-900">{f(cuotaDiaria)}</span>
                    </div>
                    <div>
                        <span className="block text-slate-500 mb-1">SBC Cotización</span>
                        <span className="font-bold text-slate-900">{f(resultado.sbc)}</span>
                        <span className="text-[10px] text-slate-400 block">Factor: {resultado.factorAplicado.toFixed(4)}</span>
                    </div>
                </div>
            </div>

            {/* 2. LIQUIDACIÓN TRABAJADOR (ANCHO COMPLETO - SIN BASE FISCAL) */}
            <div className="mb-6 border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-bold text-xs text-slate-700 uppercase flex items-center gap-2">
                    <UserCheck className="w-3 h-3" /> Liquidación Trabajador
                </div>
                <div className="p-4 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        {/* Columna Izquierda: Ingresos */}
                        <div className="space-y-2">
                            <div className="flex justify-between border-b border-slate-100 pb-1">
                                <span className="text-slate-600 font-semibold">(+) Sueldo Bruto</span>
                                <span className="font-mono font-medium">{f(resultado.bruto)}</span>
                            </div>
                            {resultado.subsidioMensual > 0 && (
                                <div className="flex justify-between text-green-700 border-b border-slate-100 pb-1">
                                    <span>(+) Subsidio Empleo</span>
                                    <span className="font-mono">{f(resultado.subsidioMensual)}</span>
                                </div>
                            )}
                        </div>

                        {/* Columna Derecha: Deducciones */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-red-700 border-b border-slate-100 pb-1">
                                <span>(-) ISR Retenido</span>
                                <span className="font-mono">-{f(resultado.isrPeriodo)}</span>
                            </div>
                            <div className="flex justify-between text-orange-700 border-b border-slate-100 pb-1">
                                <span>(-) IMSS Obrero</span>
                                <span className="font-mono">-{f(resultado.imssObrero)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="border-t-2 border-slate-900 pt-3 mt-2 flex justify-end items-center gap-4">
                        <span className="font-bold text-slate-900 uppercase">Neto a Pagar:</span>
                        <span className="font-bold text-xl text-slate-900 bg-slate-100 px-3 py-1 rounded">{f(resultado.neto)}</span>
                    </div>
                </div>
            </div>

            {/* 3. TABLA IMSS DETALLADA */}
            <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
                 <div className="bg-slate-900 text-white px-4 py-2 font-bold text-xs uppercase flex justify-between items-center">
                    <span className="flex items-center gap-2"><ShieldCheck className="w-3 h-3" /> Costo Social (Liquidación IMSS 2026)</span>
                </div>
                <table className="w-full text-[10px] md:text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                            <th className="px-3 py-2 text-left font-semibold">Rama del Seguro</th>
                            <th className="px-3 py-2 text-right font-semibold">Patrón</th>
                            <th className="px-3 py-2 text-right font-semibold">Obrero</th>
                            <th className="px-3 py-2 text-right font-semibold">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                        <tr><td className="px-3 py-1">Cuota Fija (EyM)</td><td className="px-3 text-right">{f(resultado.breakdown.cuotaFija)}</td><td className="px-3 text-right">-</td><td className="px-3 text-right font-medium">{f(resultado.breakdown.cuotaFija)}</td></tr>
                        <tr><td className="px-3 py-1">Excedente 3 UMA</td><td className="px-3 text-right">{f(resultado.breakdown.excedente.patron)}</td><td className="px-3 text-right">{f(resultado.breakdown.excedente.obrero)}</td><td className="px-3 text-right font-medium">{f(resultado.breakdown.excedente.patron + resultado.breakdown.excedente.obrero)}</td></tr>
                        <tr><td className="px-3 py-1">Prest. Dinero</td><td className="px-3 text-right">{f(resultado.breakdown.prestaciones.patron)}</td><td className="px-3 text-right">{f(resultado.breakdown.prestaciones.obrero)}</td><td className="px-3 text-right font-medium">{f(resultado.breakdown.prestaciones.patron + resultado.breakdown.prestaciones.obrero)}</td></tr>
                        <tr><td className="px-3 py-1">Gastos Méd. Pens.</td><td className="px-3 text-right">{f(resultado.breakdown.gmp.patron)}</td><td className="px-3 text-right">{f(resultado.breakdown.gmp.obrero)}</td><td className="px-3 text-right font-medium">{f(resultado.breakdown.gmp.patron + resultado.breakdown.gmp.obrero)}</td></tr>
                        <tr><td className="px-3 py-1 bg-yellow-50/50">Riesgo Trabajo ({fp(primaRiesgo/100)})</td><td className="px-3 text-right bg-yellow-50/50">{f(resultado.breakdown.rt)}</td><td className="px-3 text-right bg-yellow-50/50">-</td><td className="px-3 text-right font-medium bg-yellow-50/50">{f(resultado.breakdown.rt)}</td></tr>
                        <tr><td className="px-3 py-1">Invalidez y Vida</td><td className="px-3 text-right">{f(resultado.breakdown.iv.patron)}</td><td className="px-3 text-right">{f(resultado.breakdown.iv.obrero)}</td><td className="px-3 text-right font-medium">{f(resultado.breakdown.iv.patron + resultado.breakdown.iv.obrero)}</td></tr>
                        <tr><td className="px-3 py-1">Guarderías y PS</td><td className="px-3 text-right">{f(resultado.breakdown.guarderias)}</td><td className="px-3 text-right">-</td><td className="px-3 text-right font-medium">{f(resultado.breakdown.guarderias)}</td></tr>
                        <tr><td className="px-3 py-1">Retiro (SAR 2%)</td><td className="px-3 text-right">{f(resultado.breakdown.retiro)}</td><td className="px-3 text-right">-</td><td className="px-3 text-right font-medium">{f(resultado.breakdown.retiro)}</td></tr>
                        <tr><td className="px-3 py-1">Cesantía y Vejez</td><td className="px-3 text-right">{f(resultado.breakdown.cesantia.patron)}</td><td className="px-3 text-right">{f(resultado.breakdown.cesantia.obrero)}</td><td className="px-3 text-right font-medium">{f(resultado.breakdown.cesantia.patron + resultado.breakdown.cesantia.obrero)}</td></tr>
                        <tr className="bg-slate-50"><td className="px-3 py-1 font-semibold">INFONAVIT (5%)</td><td className="px-3 text-right font-semibold">{f(resultado.breakdown.infonavit)}</td><td className="px-3 text-right">-</td><td className="px-3 text-right font-semibold">{f(resultado.breakdown.infonavit)}</td></tr>
                        <tr className="bg-slate-800 text-white font-bold">
                            <td className="px-3 py-2">TOTALES</td>
                            <td className="px-3 py-2 text-right">{f(resultado.imssPatron)}</td>
                            <td className="px-3 py-2 text-right">{f(resultado.imssObrero)}</td>
                            <td className="px-3 py-2 text-right">{f(resultado.costoSocialTotal + resultado.imssObrero)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* FOOTER */}
            <div className="text-center text-[10px] text-slate-400 mt-8 pt-4 border-t border-slate-100">
                <p>Este documento es una proyección informativa basada en RMF 2026 y Ley del Seguro Social. No constituye un dictamen fiscal oficial.</p>
                <p className="mt-1 font-bold text-slate-600">COSTO TOTAL EMPRESA (Bruto + Patronal): {f(resultado.costoTotalEmpresa)}</p>
            </div>

        </div>
      </div>
    );
  }

  // --- VISTA NORMAL DE LA APP ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header con Exportar */}
        <div className="mb-8 border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-8 h-8 text-blue-700" />
              CALCULADORA NÓMINA 2026 Y CARGA SOCIAL
            </h1>
            <p className="text-slate-500 mt-2 flex items-center gap-2 text-sm">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">C.P. Daniel Souza</span>
              Proyección Integral: ISR, IMSS & Costo Social
            </p>
          </div>
          <div className="flex gap-2">
            <button 
                onClick={togglePrintView}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg shadow transition-all font-medium text-sm"
            >
                <Printer className="w-4 h-4" />
                PDF / Imprimir
            </button>
            <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition-all font-medium text-sm"
            >
                <FileSpreadsheet className="w-4 h-4" />
                Excel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* COLUMNA IZQUIERDA: CONFIGURACIÓN */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Tarjeta Salarial */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 relative z-10 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                Datos Generales
              </h2>
              
              {/* Cuota Diaria */}
              <div className="mb-5 relative z-10">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Salario Cuota Diaria
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-bold">$</span>
                  </div>
                  <input
                    type="number"
                    value={cuotaDiaria}
                    onChange={(e) => setCuotaDiaria(Number(e.target.value))}
                    className="block w-full pl-8 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xl font-bold text-slate-900 bg-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Selectores */}
              <div className="grid grid-cols-2 gap-4 relative z-10 mb-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Periodicidad</label>
                    <select
                        value={periodo}
                        onChange={(e) => setPeriodo(e.target.value)}
                        className="block w-full py-2 px-2 text-sm border border-slate-300 rounded-lg bg-white"
                    >
                        {Object.keys(PERIODOS).map(p => (
                        <option key={p} value={p}>{PERIODOS[p].label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Mes Cálculo</label>
                    <select
                        value={mes}
                        onChange={(e) => setMes(e.target.value)}
                        className="block w-full py-2 px-2 text-sm border border-slate-300 rounded-lg bg-white"
                    >
                        <option value="Enero">Enero 2026</option>
                        <option value="Resto">Feb-Dic 2026</option>
                    </select>
                </div>
              </div>

               {/* Zona */}
               <div className="relative z-10">
                <label className="block text-sm font-medium text-slate-700 mb-2">Zona Económica</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setZona("General")}
                    className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all border shadow-sm ${
                      zona === "General" 
                        ? "bg-blue-600 text-white border-blue-700 ring-2 ring-blue-200" 
                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    SMG RESTO PAÍS
                  </button>
                  <button
                    onClick={() => setZona("Frontera")}
                    className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all border shadow-sm ${
                      zona === "Frontera" 
                        ? "bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-200" 
                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    SMG ZLFN
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Tarjeta IMSS / SBC */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
               <h2 className="text-sm font-bold text-orange-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-orange-600" />
                Variables IMSS
              </h2>

              <div className="mb-4">
                 <label className="block text-sm font-medium text-slate-700 mb-2">
                   Prima Riesgo de Trabajo (%)
                 </label>
                 <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      step="0.00001"
                      value={primaRiesgo}
                      onChange={(e) => setPrimaRiesgo(parseFloat(e.target.value))}
                      className="block w-full py-2 px-3 border border-orange-200 rounded-lg focus:ring-orange-500 font-mono text-orange-900"
                    />
                    <span className="text-sm text-slate-500">%</span>
                 </div>
                 <p className="text-[10px] text-slate-400 mt-1">Mínima de Ley: 0.50000%</p>
              </div>

              <div className="flex items-center justify-between mb-4 bg-orange-50 p-2 rounded-lg border border-orange-100">
                  <span className="text-xs font-semibold text-orange-800 px-2">Cálculo SBC:</span>
                  <div className="flex gap-2">
                       <button 
                         onClick={() => setUsarSbcCalculado(true)}
                         className={`px-3 py-1 rounded text-xs font-bold transition-colors ${usarSbcCalculado ? 'bg-orange-500 text-white shadow' : 'text-orange-600 hover:bg-orange-200'}`}
                       >
                         Antigüedad
                       </button>
                       <button 
                         onClick={() => setUsarSbcCalculado(false)}
                         className={`px-3 py-1 rounded text-xs font-bold transition-colors ${!usarSbcCalculado ? 'bg-orange-500 text-white shadow' : 'text-orange-600 hover:bg-orange-200'}`}
                       >
                         Manual
                       </button>
                  </div>
              </div>

              {usarSbcCalculado ? (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <select
                        value={factorIdx}
                        onChange={(e) => setFactorIdx(Number(e.target.value))}
                        className="block w-full py-2 px-3 border border-orange-200 rounded-lg focus:ring-orange-500 bg-white text-sm"
                    >
                        {FACTORES_INTEGRACION.map((item, idx) => (
                            <option key={idx} value={idx}>
                                {item.label} (F.I. {item.valor})
                            </option>
                        ))}
                    </select>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <input
                        type="number"
                        value={sbcManual}
                        onChange={(e) => setSbcManual(Number(e.target.value))}
                        className="block w-full py-2 px-3 border border-orange-200 rounded-lg focus:ring-orange-500 text-orange-900 font-semibold"
                        placeholder="SBC Manual"
                    />
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-orange-100 flex justify-between items-center">
                  <span className="text-sm text-slate-600">SBC Base:</span>
                  <div className="text-right">
                      <div className="font-bold text-orange-700 text-lg">{f(resultado.sbc)}</div>
                      {resultado.sbc >= (valoresOficiales.UMA * 25) && (
                          <span className="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded border border-orange-200 block mt-1">Topado 25 UMA</span>
                      )}
                  </div>
              </div>

            </div>
          </div>

          {/* COLUMNA DERECHA: RECIBO DE NÓMINA (UI) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tarjeta de Recibo */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-800 p-6 text-white relative">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                     <UserCheck className="w-24 h-24" />
                 </div>
                 
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <h2 className="text-slate-300 font-medium text-xs uppercase tracking-widest mb-1">Neto a Recibir ({periodo})</h2>
                    <div className="text-5xl font-bold tracking-tight">{f(resultado.neto)}</div>
                    <div className="text-slate-400 text-sm mt-2">{resultado.dias} días trabajados</div>
                  </div>
                  {resultado.esExento && (
                    <div className="text-right">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        Exento ISR
                        </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8">
                <div className="space-y-4">
                    {/* Percepciones */}
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">P</div>
                            <div>
                                <span className="font-medium text-slate-700 block">Sueldo Bruto</span>
                            </div>
                        </div>
                        <span className="font-bold text-slate-900">{f(resultado.bruto)}</span>
                    </div>

                    {/* Deducciones */}
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs">ISR</div>
                            <div>
                                <span className="font-medium text-slate-700 block">Retención ISR</span>
                                {resultado.subsidioMensual > 0 && <span className="text-xs text-green-600">Subsidio aplicado</span>}
                            </div>
                        </div>
                        <span className="font-bold text-red-600">- {f(resultado.isrPeriodo)}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-xs">IMSS</div>
                            <div>
                                <span className="font-medium text-slate-700 block">Cuota Obrera IMSS</span>
                            </div>
                        </div>
                        <span className="font-bold text-orange-600">- {f(resultado.imssObrero)}</span>
                    </div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between text-sm">
                  <span className="text-slate-500">Total Deducciones:</span>
                  <span className="font-bold text-slate-700">{f(resultado.isrPeriodo + resultado.imssObrero)}</span>
              </div>
            </div>

            {/* Acordeón Detalle Fiscal */}
            <div className="bg-blue-50/50 rounded-xl border border-blue-100 overflow-hidden">
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex justify-between items-center p-4 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center gap-2 text-blue-800 font-semibold text-sm">
                  <Info className="w-4 h-4" />
                  Ver Desglose del Cálculo ISR
                </div>
                {showDetails ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />}
              </button>
              
              {showDetails && (
                <div className="p-5 border-t border-blue-100 bg-white text-sm grid grid-cols-2 gap-2">
                      <div className="text-slate-500">Base Mensual:</div>
                      <div className="text-right font-mono text-slate-700">{f(resultado.baseMensual)}</div>
                      <div className="text-slate-500">ISR Mensual:</div>
                      <div className="text-right font-mono text-slate-700">{f(resultado.isrMensualTeorico)}</div>
                      <div className="text-slate-500">Subsidio:</div>
                      <div className="text-right font-mono text-green-600">-{f(resultado.subsidioMensual)}</div>
                      <div className="col-span-2 border-t border-slate-200 my-1"></div>
                      <div className="font-semibold text-blue-800">ISR Final Periodo:</div>
                      <div className="text-right font-bold text-blue-800">{f(resultado.isrPeriodo)}</div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* --- LIQUIDACIÓN IMSS DETALLADA (UI) --- */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center cursor-pointer" onClick={() => setShowImssDetails(!showImssDetails)}>
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-green-400" />
                    <div>
                        <h3 className="text-white font-bold text-lg">Costo Social Total (Liquidación IMSS 2026)</h3>
                        <p className="text-slate-400 text-xs">Desglose de Cuotas Obrero-Patronales por Rama</p>
                    </div>
                </div>
                {showImssDetails ? <ChevronUp className="text-slate-400"/> : <ChevronDown className="text-slate-400"/>}
            </div>
            
            {showImssDetails && (
            <div className="p-0 overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3">Concepto / Rama de Seguro</th>
                            <th className="px-6 py-3 text-right text-blue-700">Patrón (Empresa)</th>
                            <th className="px-6 py-3 text-right text-orange-600">Trabajador (Obrero)</th>
                            <th className="px-6 py-3 text-right text-slate-800">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr className="hover:bg-slate-50/50">
                            <td className="px-6 py-2">
                                <span className="block font-medium text-slate-700">Cuota Fija (EyM)</span>
                                <span className="text-xs text-slate-400">20.40% UMA (Solo Patrón)</span>
                            </td>
                            <td className="px-6 py-2 text-right font-mono text-slate-600">{f(resultado.breakdown.cuotaFija)}</td>
                            <td className="px-6 py-2 text-right font-mono text-slate-400">-</td>
                            <td className="px-6 py-2 text-right font-mono font-medium">{f(resultado.breakdown.cuotaFija)}</td>
                        </tr>
                        
                        <tr className="hover:bg-slate-50/50">
                            <td className="px-6 py-2">
                                <span className="block font-medium text-slate-700">Excedente 3 UMA</span>
                                <span className="text-xs text-slate-400">1.10% / 0.40% del Excedente</span>
                            </td>
                            <td className="px-6 py-2 text-right font-mono text-slate-600">{f(resultado.breakdown.excedente.patron)}</td>
                            <td className="px-6 py-2 text-right font-mono text-slate-600">{f(resultado.breakdown.excedente.obrero)}</td>
                            <td className="px-6 py-2 text-right font-mono font-medium">{f(resultado.breakdown.excedente.patron + resultado.breakdown.excedente.obrero)}</td>
                        </tr>

                        <tr className="hover:bg-slate-50/50">
                            <td className="px-6 py-2">
                                <span className="block font-medium text-slate-700">Prestaciones en Dinero</span>
                                <span className="text-xs text-slate-400">0.70% / 0.25% SBC</span>
                            </td>
                            <td className="px-6 py-2 text-right font-mono text-slate-600">{f(resultado.breakdown.prestaciones.patron)}</td>
                            <td className="px-6 py-2 text-right font-mono text-slate-600">{f(resultado.breakdown.prestaciones.obrero)}</td>
                            <td className="px-6 py-2 text-right font-mono font-medium">{f(resultado.breakdown.prestaciones.patron + resultado.breakdown.prestaciones.obrero)}</td>
                        </tr>

                        <tr className="hover:bg-slate-50/50">
                            <td className="px-6 py-2">
                                <span className="block font-medium text-slate-700">Gastos Méd. Pensionados</span>
                                <span className="text-xs text-slate-400">1.05% / 0.375% SBC</span>
                            </td>
                            <td className="px-6 py-2 text-right font-mono text-slate-600">{f(resultado.breakdown.gmp.patron)}</td>
                            <td className="px-6 py-2 text-right font-mono text-slate-600">{f(resultado.breakdown.gmp.obrero)}</td>
                            <td className="px-6 py-2 text-right font-mono font-medium">{f(resultado.breakdown.gmp.patron + resultado.breakdown.gmp.obrero)}</td>
                        </tr>

                        <tr className="hover:bg-slate-50/50 bg-yellow-50/30">
                            <td className="px-6 py-2 border-l-4 border-yellow-400">
                                <span className="block font-medium text-slate-800">Riesgo de Trabajo</span>
                                <span className="text-xs text-slate-500">Prima: {fp(primaRiesgo/100)} SBC</span>
                            </td>
                            <td className="px-6 py-2 text-right font-mono text-slate-800 font-semibold">{f(resultado.breakdown.rt)}</td>
                            <td className="px-6 py-2 text-right font-mono text-slate-400">-</td>
                            <td className="px-6 py-2 text-right font-mono font-bold">{f(resultado.breakdown.rt)}</td>
                        </tr>

                         <tr className="hover:bg-slate-50/50">
                            <td className="px-6 py-2">
                                <span className="block font-medium text-slate-700">Invalidez y Vida</span>
                                <span className="text-xs text-slate-400">1.75% / 0.625% SBC</span>
                            </td>
                            <td className="px-6 py-2 text-right font-mono text-slate-600">{f(resultado.breakdown.iv.patron)}</td>
                            <td className="px-6 py-2 text-right font-mono text-slate-600">{f(resultado.breakdown.iv.obrero)}</td>
                            <td className="px-6 py-2 text-right font-mono font-medium">{f(resultado.breakdown.iv.patron + resultado.breakdown.iv.obrero)}</td>
                        </tr>

                        <tr className="hover:bg-slate-50/50">
                            <td className="px-6 py-2">
                                <span className="block font-medium text-slate-700">Guarderías y PS</span>
                                <span className="text-xs text-slate-400">1.00% SBC (Solo Patrón)</span>
                            </td>
                            <td className="px-6 py-2 text-right font-mono text-slate-600">{f(resultado.breakdown.guarderias)}</td>
                            <td className="px-6 py-2 text-right font-mono text-slate-400">-</td>
                            <td className="px-6 py-2 text-right font-mono font-medium">{f(resultado.breakdown.guarderias)}</td>
                        </tr>

                         <tr className="hover:bg-slate-50/50 bg-blue-50/30">
                            <td className="px-6 py-2 border-l-4 border-blue-400">
                                <span className="block font-medium text-slate-700">Retiro (SAR 2%)</span>
                                <span className="text-xs text-slate-400">2.00% SBC (Solo Patrón)</span>
                            </td>
                            <td className="px-6 py-2 text-right font-mono text-slate-600">{f(resultado.breakdown.retiro)}</td>
                            <td className="px-6 py-2 text-right font-mono text-slate-400">-</td>
                            <td className="px-6 py-2 text-right font-mono font-medium">{f(resultado.breakdown.retiro)}</td>
                        </tr>

                         <tr className="hover:bg-slate-50/50 bg-blue-50/30">
                            <td className="px-6 py-2 border-l-4 border-blue-400">
                                <span className="block font-medium text-slate-700">Cesantía y Vejez</span>
                                <span className="text-xs text-slate-400">Patrón Progresivo ({fp(resultado.breakdown.cesantia.pctPatron)}) / Obrero 1.125%</span>
                            </td>
                            <td className="px-6 py-2 text-right font-mono text-slate-600">{f(resultado.breakdown.cesantia.patron)}</td>
                            <td className="px-6 py-2 text-right font-mono text-slate-600">{f(resultado.breakdown.cesantia.obrero)}</td>
                            <td className="px-6 py-2 text-right font-mono font-medium">{f(resultado.breakdown.cesantia.patron + resultado.breakdown.cesantia.obrero)}</td>
                        </tr>

                        <tr className="hover:bg-slate-50/50 bg-indigo-50/30 border-t-2 border-slate-100">
                            <td className="px-6 py-2 border-l-4 border-indigo-400">
                                <span className="block font-medium text-indigo-900">INFONAVIT 5%</span>
                                <span className="text-xs text-indigo-400">Aportación Patronal de Vivienda</span>
                            </td>
                            <td className="px-6 py-2 text-right font-mono text-indigo-700 font-bold">{f(resultado.breakdown.infonavit)}</td>
                            <td className="px-6 py-2 text-right font-mono text-slate-400">-</td>
                            <td className="px-6 py-2 text-right font-mono text-indigo-900 font-bold">{f(resultado.breakdown.infonavit)}</td>
                        </tr>

                         <tr className="bg-slate-900 text-white">
                            <td className="px-6 py-4">
                                <span className="block font-bold uppercase tracking-wider text-xs">Costo Total del Periodo</span>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-lg">{f(resultado.costoSocialTotal)}</td>
                            <td className="px-6 py-4 text-right font-bold text-lg text-orange-200">{f(resultado.imssObrero)}</td>
                            <td className="px-6 py-4 text-right font-bold text-lg">{f(resultado.costoSocialTotal + resultado.imssObrero)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            )}
            
            <div className="bg-slate-50 p-4 text-center border-t border-slate-200">
                <p className="text-xs text-slate-500">
                    *Cálculo de Cuota Patronal de Cesantía y Vejez basado en reforma LSS Art. 168 (Tablas Progresivas 2026).
                </p>
                <div className="mt-2 flex justify-center gap-6 text-sm font-semibold text-slate-700">
                    <span className="flex items-center gap-2"><PieChart className="w-4 h-4"/> Costo Total Empresa (Bruto + Carga Social): {f(resultado.costoTotalEmpresa)}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}