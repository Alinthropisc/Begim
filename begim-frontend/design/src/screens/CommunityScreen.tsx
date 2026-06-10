export function CommunityScreen({ onRecipeClick }: { onRecipeClick?: () => void }) {
  return (
    <div className="p-4 text-center text-[var(--tg-theme-hint-color)]">
      <p className="text-4xl mb-4">💬</p>
      <p>Community ekrani</p>
      <button
        onClick={onRecipeClick}
        className="mt-4 px-6 py-3 bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] rounded-xl font-semibold"
      >
        Retsept ko'rish
      </button>
    </div>
  );
}
