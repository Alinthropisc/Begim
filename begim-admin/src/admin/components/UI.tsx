import { type ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
};

export function Card({ children, className = "", title, action }: CardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-[#C9A961]/20 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#C9A961]/10">
          {title && <h3 className="font-[Cormorant_Garamond] text-xl font-semibold text-[#2B1810]">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string | number;
  delta?: number;
  icon: ReactNode;
  color?: string;
};

export function StatCard({ label, value, delta, icon, color = "bordeaux" }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    bordeaux: "from-[#8B2635] to-[#6B1A27] text-[#FBF5EC]",
    gold: "from-[#C9A961] to-[#E4CE8A] text-[#2B1810]",
    emerald: "from-[#2D5F4E] to-[#1f4538] text-[#FBF5EC]",
    dark: "from-[#2B1810] to-[#1a0f08] text-[#FBF5EC]",
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorClasses[color]} p-5 shadow-md`}>
      <div className="absolute -right-4 -top-4 opacity-10 text-[120px] leading-none pointer-events-none">
        {icon}
      </div>
      <div className="relative">
        <div className="text-xs uppercase tracking-wider opacity-80 mb-2">{label}</div>
        <div className="font-[Cormorant_Garamond] text-3xl md:text-4xl font-bold leading-none mb-2">
          {value}
        </div>
        {delta !== undefined && (
          <div className={`text-xs font-semibold flex items-center gap-1 ${delta >= 0 ? "text-[#E4CE8A]" : "text-red-300"}`}>
            <span>{delta >= 0 ? "↑" : "↓"}</span>
            <span>{Math.abs(delta)}% за неделю</span>
          </div>
        )}
      </div>
    </div>
  );
}

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${className}`}>
      {children}
    </span>
  );
}

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md";
  onClick?: () => void;
  className?: string;
  icon?: ReactNode;
};

export function Button({ children, variant = "primary", size = "md", onClick, className = "", icon }: ButtonProps) {
  const variants: Record<string, string> = {
    primary: "bg-[#8B2635] text-[#FBF5EC] hover:bg-[#6B1A27] shadow-sm",
    secondary: "bg-white text-[#2B1810] border border-[#C9A961]/30 hover:border-[#C9A961]",
    ghost: "bg-transparent text-[#8B7355] hover:bg-[#FBF5EC]",
    danger: "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200",
    success: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200",
  };
  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium transition ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description?: string;
};

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-[#FBF5EC] flex items-center justify-center text-3xl mb-4">
        {icon}
      </div>
      <h3 className="font-[Cormorant_Garamond] text-xl font-semibold text-[#2B1810] mb-1">{title}</h3>
      {description && <p className="text-sm text-[#8B7355] max-w-sm">{description}</p>}
    </div>
  );
}
