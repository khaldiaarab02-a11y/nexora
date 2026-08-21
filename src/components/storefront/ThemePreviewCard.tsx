import type { ThemeConfig } from "@/themes/types";

export default function ThemePreviewCard({
  theme,
  active,
  locked,
  onSelect,
}: {
  theme: ThemeConfig;
  active: boolean;
  locked: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group w-full overflow-hidden rounded-2xl border text-right transition ${
        active ? "border-zinc-900 ring-2 ring-zinc-900/10" : "border-zinc-200 hover:border-zinc-400"
      }`}
      aria-label={locked ? `${theme.name} — Business` : `اختيار ${theme.name}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden p-4" style={{ background: theme.preview.background, color: theme.preview.foreground }}>
        <div className="h-4 w-1/3 rounded-full opacity-80" style={{ background: theme.preview.foreground }} />
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="h-20 rounded-xl bg-white/80 shadow-sm" />
          <div className="h-20 rounded-xl bg-white/60 shadow-sm" />
          <div className="h-20 rounded-xl bg-white/80 shadow-sm" />
        </div>
        <div className="absolute bottom-4 end-4 h-2 w-16 rounded-full" style={{ background: theme.preview.accent }} />
        {locked && (
          <span className="absolute start-3 top-3 rounded-full bg-zinc-900 px-2.5 py-1 text-[10px] font-bold text-white">
            🔒 Business
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 bg-white p-4">
        <div>
          <p className="font-bold text-zinc-900">{theme.name}</p>
          <p className="mt-1 text-xs leading-5 text-zinc-500">{theme.description}</p>
        </div>
        {active && !locked ? (
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">✓ Active</span>
        ) : (
          <span className="shrink-0 rounded-lg bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-700">
            {locked ? "Business" : "Use theme"}
          </span>
        )}
      </div>
    </button>
  );
}
