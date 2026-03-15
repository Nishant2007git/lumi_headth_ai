export function Card({ children, className = "", hover = true }) {
  return (
    <div className={`glass-card p-6 ${hover ? "hover:scale-[1.02] hover:shadow-xl" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, icon: Icon, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-center">
        {Icon && (
          <div className="p-3 bg-primary-50 rounded-2xl mr-4">
            <Icon className="h-6 w-6 text-primary-600" />
          </div>
        )}
        <div>
          <h3 className="text-xl font-black tracking-tight text-slate-900 leading-tight">{title}</h3>
          {subtitle && <p className="text-sm font-medium text-slate-500 mt-1">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
