import React from 'react';

const BLADE_COUNT = 12;
const INNER_R = 4.2;
const OUTER_R = 7.8;
const PERIOD = 1; // seconds

function bladeCoords(index: number) {
  const angle = (index / BLADE_COUNT) * 2 * Math.PI;
  return {
    x1: 12 + INNER_R * Math.sin(angle),
    y1: 12 - INNER_R * Math.cos(angle),
    x2: 12 + OUTER_R * Math.sin(angle),
    y2: 12 - OUTER_R * Math.cos(angle),
    delay: -((BLADE_COUNT - index) / BLADE_COUNT) * PERIOD,
  };
}

const SIZES = { sm: 14, md: 20, lg: 32, xl: 44 } as const;

interface SpinnerProps {
  size?: keyof typeof SIZES | number;
  color?: string;
  className?: string;
}

export function Spinner({ size = 'md', color = 'currentColor', className = '' }: SpinnerProps) {
  const px = typeof size === 'number' ? size : SIZES[size];

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Chargement…"
      className={className}
      style={{ flexShrink: 0 }}
    >
      {Array.from({ length: BLADE_COUNT }, (_, i) => {
        const { x1, y1, x2, y2, delay } = bladeCoords(i);
        return (
          <line
            key={i}
            x1={x1} y1={y1}
            x2={x2} y2={y2}
            stroke={color}
            strokeWidth="1.85"
            strokeLinecap="round"
            className="spinner-blade"
            style={{ animationDelay: `${delay.toFixed(3)}s` }}
          />
        );
      })}
    </svg>
  );
}

/* ─── Full-area overlay (page / section loader) ──────────────────────────── */
interface SpinnerOverlayProps {
  label?: string;
}

export function SpinnerOverlay({ label }: SpinnerOverlayProps) {
  return (
    <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center gap-4"
      style={{ background: 'rgba(242,242,247,0.72)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
    >
      <Spinner size="xl" color="var(--apple-gray)" />
      {label && (
        <p className="text-sm font-medium" style={{ color: 'var(--apple-label)' }}>{label}</p>
      )}
    </div>
  );
}

/* ─── Inline section loader (replaces skeleton in simple cases) ──────────── */
export function SpinnerSection({ label }: SpinnerOverlayProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Spinner size="lg" color="var(--apple-gray)" />
      {label && (
        <p className="text-xs" style={{ color: 'var(--apple-label)' }}>{label}</p>
      )}
    </div>
  );
}
