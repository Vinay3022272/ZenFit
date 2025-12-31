import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRightIcon, Sparkles } from "lucide-react";

const NoFitnessPlan = () => {
  return (
    <div className="relative bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-xl overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xl shadow-blue-500/30 mb-6">
          <Sparkles className="w-10 h-10" />
        </div>

        <h2 className="text-3xl font-bold mb-4">
          <span className="text-slate-900 dark:text-slate-100">No Plans Yet</span>
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto text-lg leading-relaxed">
          Start your fitness journey by creating a personalized plan tailored specifically to your goals and lifestyle.
        </p>
        <Button
          size="lg"
          asChild
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg font-semibold rounded-2xl shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-105 transition-all"
        >
          <Link href="/generate-program">
            <span className="flex items-center">
              Create Your First Plan
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NoFitnessPlan;



