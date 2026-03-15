import { Loader2 } from 'lucide-react';

export function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  className = "", 
  icon: Icon,
  loading = false,
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center font-black transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/20",
    secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
    outline: "bg-transparent text-primary-600 border border-primary-300 hover:bg-primary-50",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
  };
  
  const sizes = {
    sm: "px-4 py-2 text-xs rounded-xl",
    md: "px-6 py-3 text-sm rounded-2xl",
    lg: "px-10 py-4 text-base rounded-2xl",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant] ?? variants.primary} ${sizes[size]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <Loader2 className={`animate-spin h-5 w-5 ${children ? "mr-2" : ""}`} />
      ) : Icon && (
        <Icon className={`${children ? "mr-2" : ""} h-5 w-5`} />
      )}
      {children}
    </button>
  );
}
