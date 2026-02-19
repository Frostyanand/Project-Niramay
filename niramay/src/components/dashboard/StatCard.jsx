export default function StatCard({ label, value, subtext, trend, icon: Icon }) {
    return (
        <div className="flex flex-col p-4 rounded-lg bg-cyan-950/10 border border-cyan-500/10 hover:border-cyan-500/30 transition-all group">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-cyan-400/70 uppercase tracking-wider">{label}</span>
                {Icon && <Icon className="w-4 h-4 text-cyan-500/50 group-hover:text-cyan-400 transition-colors" />}
            </div>

            <div className="text-2xl font-bold text-white tracking-tight tabular-nums">
                {value}
            </div>

            {subtext && (
                <div className="mt-1 flex items-center gap-2">
                    {trend && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {trend === 'up' ? '↗' : '↘'}
                        </span>
                    )}
                    <span className="text-[10px] text-cyan-300/40 truncate">{subtext}</span>
                </div>
            )}
        </div>
    );
}
