const TerminalOverlay = () => {
  return (
    <div className="absolute bottom-4 left-4 right-4">
      <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-4 overflow-hidden shadow-2xl">
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        {/* Status bar */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50"></div>
            <p className="text-xs font-semibold text-green-600 dark:text-green-400">SESSION ACTIVE</p>
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">ID: ZF-93217</p>
        </div>

        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Today's Workout Summary
        </p>

        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs shadow-lg">
              1
            </div>
            <span className="text-slate-700 dark:text-slate-300">35 min resistance workout (upper focus)</span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs shadow-lg">
              2
            </div>
            <span className="text-slate-700 dark:text-slate-300">15 min cardio calibration (steady pace)</span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-600 text-white font-bold text-xs shadow-lg">
              3
            </div>
            <span className="text-slate-700 dark:text-slate-300">10 min mobility + cooldown routine</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalOverlay;












