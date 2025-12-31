import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronRight,
  Dumbbell,
  Sparkles,
  Users,
  Clock,
  AppleIcon,
  ShieldIcon,
} from "lucide-react";
import { USER_PROGRAMS } from "@/constants";

const UserPrograms = () => {
  return (
    <div className="w-full pb-24 pt-16 relative">
      <div className="container mx-auto max-w-6xl px-4">
        {/* HEADER - PROGRAM GALLERY */}
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden mb-16 shadow-xl">
          {/* HEADER CONTENT */}
          <div className="p-12 text-center">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium">
                ✨ Curated by AI
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">Discover </span>
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Smart Programs</span>
            </h2>

            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Real training and nutrition plans designed by AI for people with goals just like yours. Get inspired and start your transformation today.
            </p>

            {/* STATS */}
            <div className="flex items-center justify-center gap-16 mt-10">
              <div className="flex flex-col items-center">
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">5+</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wide mt-2">
                  Plans Created
                </p>
              </div>
              <div className="w-px h-16 bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>
              <div className="flex flex-col items-center">
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">3 min</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wide mt-2">
                  Build Time
                </p>
              </div>
              <div className="w-px h-16 bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>
              <div className="flex flex-col items-center">
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">100%</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 uppercase tracking-wide mt-2">
                  Custom Fit
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Program cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {USER_PROGRAMS.map((program) => (
            <Card
              key={program.id}
              className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden rounded-2xl group"
            >
              {/* Card header with user info */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">PROFILE #{program.id}</span>
                </div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {program.fitness_level}
                </div>
              </div>

              <CardHeader className="pt-6 px-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-lg">
                    <img
                      src={program.profilePic}
                      alt={`${program.first_name}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {program.first_name}<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">.fit</span>
                    </CardTitle>
                    <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-1">
                      <Users className="h-4 w-4" />
                      {program.age} yrs • {program.workout_days} days/week
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center gap-4">
                  <div className="px-3 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-500/20 text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {program.fitness_goal}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    v3.5
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-6 pb-6">
                {/* Program details */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                      <Dumbbell className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                        {program.workout_plan.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {program.equipment_access}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                      <AppleIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{program.diet_plan.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Adaptive meal guidance
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
                      <ShieldIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">AI Safety Systems</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Smart risk controls
                      </p>
                    </div>
                  </div>
                </div>

                {/* Program description */}
                <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {program.workout_plan.description}
                  </p>
                </div>
              </CardContent>

              <CardFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                <Link href={`/programs/${program.id}`} className="w-full">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/30 transition-all">
                    View Full Program
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* CTA section */}
        <div className="mt-20 text-center">
          <Link href="/generate-program">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-7 text-lg font-semibold rounded-2xl shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-105 transition-all"
            >
              Create Your Own Plan
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <p className="text-slate-600 dark:text-slate-400 mt-6 text-lg">
            Join thousands building AI-driven fitness journeys
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserPrograms;













