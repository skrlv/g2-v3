"use client";

export function SizeSelector({
  sizes,
  value,
  onChange,
  compact = false,
}: {
  sizes: string[];
  value: string;
  onChange: (size: string) => void;
  compact?: boolean;
}) {
  return (
    <div className="space-y-3">
      {compact ? null : (
        <div className="flex items-center justify-between">
          <span className="eyebrow">Размер</span>
          <span className="meta">{value ? `Выбрано — ${value}` : "Выберите размер"}</span>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isActive = size === value;
          return (
            <button
              key={size}
              type="button"
              onClick={() => onChange(size)}
              data-cursor="hover"
              aria-pressed={isActive}
              className={`min-w-11 border px-3 py-2.5 text-[0.6875rem] uppercase tracking-[0.14em] transition-[background-color,border-color,color,transform] duration-500 ease-[var(--ease-premium)] ${
                isActive
                  ? "border-bone bg-bone text-void"
                  : "border-bone/18 text-bone/75 hover:border-bone/50 hover:text-bone"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
