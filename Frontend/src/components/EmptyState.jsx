export default function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/10 rounded-2xl bg-[#0f172a]/40 backdrop-blur">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                <span className="text-3xl">📄</span>
            </div>
            <h3 className="text-base font-bold text-white">No Logs Yet</h3>
            <p className="text-sm text-white/50 mt-2 max-w-sm">
                Upload your log file to see AI Insights, critical alerts and live stream.<br/>
                Supports <span className="text-white/80">.log,.txt,.csv</span>
            </p>
        </div>
    );
}