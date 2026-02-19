export default function GlassPanel({ children, className = '', title, action }) {
    return (
        <div className={`relative overflow-hidden rounded-xl bg-slate-950/40 backdrop-blur-md border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)] ${className}`}>
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-sm pointer-events-none" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-500/50 rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500/50 rounded-br-sm pointer-events-none" />

            {/* Header if title exists */}
            {(title || action) && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/10 bg-cyan-950/20">
                    {title && <h3 className="text-sm font-semibold tracking-wider text-cyan-100 uppercase">{title}</h3>}
                    {action && <div className="text-xs">{action}</div>}
                </div>
            )}

            {/* Content */}
            <div className="p-6">
                {children}
            </div>
        </div>
    );
}
