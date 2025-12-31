import TerminalOverlay from "@/components/TerminalOverlay";
import { Button } from "@/components/ui/button";
import UserPrograms from "@/components/UserPrograms";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 text-foreground overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <section className="relative z-10 py-24 grow">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Side content */}
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-block">
                <span className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium">
                  ✨ AI-Powered Fitness Platform
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
                <div className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  Transform Your
                </div>
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Body & Mind
                </div>
                <div className="pt-2 text-slate-800 dark:text-slate-200">
                  With Smart AI
                </div>
              </h1>

              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                Experience the future of fitness with AI-crafted workout plans and personalized nutrition guidance designed for your unique journey.
              </p>

              {/* STATS */}
              <div className="flex flex-wrap items-center gap-8 py-6">
                <div className="flex flex-col space-y-1">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">5+</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Active Members
                  </div>
                </div>

                <div className="h-12 w-px bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>

                <div className="flex flex-col space-y-1">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">3 min</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Plan Creation
                  </div>
                </div>

                <div className="h-12 w-px bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>

                <div className="flex flex-col space-y-1">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">100%</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Personalized
                  </div>
                </div>
              </div>

              {/* Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105"
                >
                  <Link href={"/generate-program"} className="flex items-center">
                    Start Your Journey
                    <ArrowRightIcon className="ml-2 size-5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* RIGHT SIDE CONTENT */}
            <div className="lg:col-span-5 relative">
              {/* Floating card effect */}
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl blur-2xl"></div>
                
                <div className="relative overflow-hidden rounded-3xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-2xl">
                  <img
                    src="/workout.jpg"
                    alt="AI Fitness Coach"
                    className="size-full object-cover object-center"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                  
                  {/* Floating elements */}
                  <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Live Tracking</span>
                    </div>
                  </div>

                  {/* Stats overlay */}
                  <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2">
                    <div className="px-3 py-2 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
                      <div className="text-xs text-slate-500 dark:text-slate-400">Calories</div>
                      <div className="text-lg font-bold text-blue-600">450</div>
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-indigo-200/50 dark:border-indigo-800/50 shadow-lg">
                      <div className="text-xs text-slate-500 dark:text-slate-400">Duration</div>
                      <div className="text-lg font-bold text-indigo-600">45m</div>
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-purple-200/50 dark:border-purple-800/50 shadow-lg">
                      <div className="text-xs text-slate-500 dark:text-slate-400">Heart</div>
                      <div className="text-lg font-bold text-purple-600">142</div>
                    </div>
                  </div>
                </div>

                {/* Terminal Overlay */}
                <TerminalOverlay />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <UserPrograms />
    </div>
  );
};

export default HomePage;
















