import { useEffect, useState } from 'react';
import { aNumero } from '../formato';

interface Props {
  value: number;
  onValue: (v: number) => void;
  className?: string;
  step?: string;
  min?: string;
  max?: string;
  placeholder?: string;
  prefijo?: string;
  sufijo?: string;
  id?: string;
  'aria-label'?: string;
}

/**
 * Entrada numérica controlada por texto: permite borrar y escribir sin que el
 * campo salte a "0", y entrega siempre un número finito al motor.
 */
export default function InputNumero({ value, onValue, className, step, min, max, placeholder, prefijo, sufijo, id, ...rest }: Props) {
  const [texto, setTexto] = useState(String(value));

  useEffect(() => {
    if (aNumero(texto) !== value) setTexto(Number.isFinite(value) ? String(value) : '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative flex items-center">
      {prefijo && (
        <span className="absolute left-3 text-neutro-grafito font-bold pointer-events-none select-none">{prefijo}</span>
      )}
      <input
        id={id}
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        max={max}
        placeholder={placeholder}
        value={texto}
        aria-label={rest['aria-label']}
        onChange={(e) => {
          setTexto(e.target.value);
          onValue(aNumero(e.target.value));
        }}
        className={`${className ?? ''} ${prefijo ? 'pl-8' : ''} ${sufijo ? 'pr-8' : ''}`}
      />
      {sufijo && <span className="absolute right-3 text-sm text-neutro-grafito pointer-events-none select-none">{sufijo}</span>}
    </div>
  );
}
