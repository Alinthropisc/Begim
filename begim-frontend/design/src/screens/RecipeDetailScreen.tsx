export function RecipeDetailScreen({ onBack }: { onBack?: () => void }) {
  return (
    <div className="p-4">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-1 text-sm text-[var(--color-bordeaux)] font-medium"
        >
          ‹ Orqaga
        </button>
      )}
      <div className="text-center text-[var(--tg-theme-hint-color)]">
        <p className="text-4xl mb-4">📖</p>
        <p>Recipe Detail ekrani</p>
      </div>
    </div>
  );
}
