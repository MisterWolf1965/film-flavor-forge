import { STYLES, type CinematicStyle } from "@/lib/cinematic-data";

interface StyleSelectorProps {
  selected: CinematicStyle | null;
  onSelect: (style: CinematicStyle) => void;
  disabled?: boolean;
}

export function StyleSelector({ selected, onSelect, disabled }: StyleSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {STYLES.map((style) => {
        const isActive = selected?.id === style.id;
        return (
          <button
            key={style.id}
            onClick={() => onSelect(style)}
            disabled={disabled}
            className={`group relative p-4 rounded-lg text-left transition-all duration-300 film-border ${
              isActive
                ? "bg-primary/10 border-primary/50 glow-gold"
                : "bg-card hover:bg-secondary border-border hover:border-primary/30"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="text-2xl mb-2">{style.icon}</div>
            <div className={`font-mono text-sm font-bold mb-1 ${isActive ? "text-primary" : "text-foreground"}`}>
              {style.label}
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {style.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}
