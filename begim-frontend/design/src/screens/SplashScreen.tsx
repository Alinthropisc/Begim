export function SplashScreen() {
  return (
    <div className="h-screen flex flex-col items-center justify-center pattern-bg bg-[var(--color-bordeaux)]">
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-15">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="stars" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
              <polygon
                points="25,5 35,15 35,25 25,35 15,25 15,15"
                fill="none"
                stroke="#C9A961"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#stars)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center animate-fade-in">
        {/* Logo circle */}
        <div className="w-28 h-28 rounded-full bg-[var(--color-cream)] border-4 border-[var(--color-gold)] flex items-center justify-center text-5xl shadow-2xl shadow-black/40">
          🥮
        </div>

        {/* App name */}
        <h1
          className="mt-6 text-6xl gradient-gold"
          style={{ fontFamily: "'Amiri', serif", letterSpacing: '0.05em' }}
        >
          Begim
        </h1>

        {/* Tagline */}
        <p
          className="mt-2 text-[var(--color-cream)] text-lg italic"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Uy shirinliklari bozori
        </p>

        {/* Loader */}
        <div className="mt-10 w-6 h-6 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}
