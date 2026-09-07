import type { ReactNode } from 'react';
import { moneda } from '../formato';
import InputNumero from './InputNumero';

/** Campo numérico con etiqueta y nota, para los paneles de las herramientas fiscales. */
export function Campo({
  label,
  value,
  onValue,
  nota,
  prefijo = '$',
  sufijo,
  step = '0.01',
  min = '0',
}: {
  label: string;
  value: number;
  onValue: (v: number) => void;
  nota?: string;
  prefijo?: string;
  sufijo?: string;
  step?: string;
  min?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-neutro-grafito mb-1">{label}</span>
      <InputNumero
        value={value}
        onValue={onValue}
        prefijo={prefijo}
        sufijo={sufijo}
        step={step}
        min={min}
        className="block w-full py-2 px-3 border border-neutro-niebla rounded-lg focus:ring-2 focus:ring-cian-500 focus:border-cian-500 text-azul-600 font-mono tabular bg-white"
      />
      {nota && <span className="block text-[10px] text-neutro-grafito mt-1">{nota}</span>}
    </label>
  );
}

/** Renglón etiqueta/valor para bloques de resultado. */
export function Renglon({ k, sub, v, tono, fuerte }: { k: string; sub?: string; v: number; tono?: string; fuerte?: boolean }) {
  return (
    <div className={`flex justify-between items-start py-1.5 border-b border-neutro-arena ${fuerte ? 'font-semibold' : ''}`}>
      <span className="text-neutro-grafito">
        {k}
        {sub && <span className="block text-[10px] text-neutro-grafito/80">{sub}</span>}
      </span>
      <span className={`font-mono tabular ${tono ?? 'text-azul-600'}`}>{moneda(v)}</span>
    </div>
  );
}

export function Tarjeta({ titulo, icono, filete = 'cian', children }: { titulo: string; icono?: ReactNode; filete?: 'cian' | 'azul' | 'acento' | 'ambar'; children: ReactNode }) {
  const color = { cian: 'bg-cian-600', azul: 'bg-azul-500', acento: 'bg-acento-600', ambar: 'bg-ambar-600' }[filete];
  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-neutro-niebla relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1.5 h-full ${color}`} aria-hidden />
      <h2 className="font-serif text-base font-bold text-azul-600 mb-4 flex items-center gap-2">{icono}{titulo}</h2>
      {children}
    </section>
  );
}
