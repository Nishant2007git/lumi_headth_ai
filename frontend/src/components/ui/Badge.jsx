export function Badge({ children, variant = "primary", className = "" }) {
  const variants = {
    primary: "bg-primary-50 text-primary-700 border-primary-100",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    danger: "bg-red-50 text-red-700 border-red-100",
    neutral: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
