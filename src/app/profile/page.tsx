"use client"
import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import {api} from "../../../convex/_generated/api"
import React, { useState } from 'react'
import ProfileHeader from '@/components/ProfileHeader'
import NoFitnessPlan from '@/components/NoFitnessPlan'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppleIcon, CalendarIcon, DumbbellIcon } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const ProfilePage = () => {
  const {user} = useUser()
  const userId = user?.id as string
  const allPlans = useQuery( api.plans.getUserPlans, {userId})

  const [selectedPlanId, setSelectedPlanId] =useState<null | string>(null)

  const activePlan = allPlans?.find(plan => plan.isActive)
  const currentPlan = selectedPlanId ? allPlans?.find(plan => plan._id === selectedPlanId) : activePlan

  return (
    <section className="relative z-10 pt-24 pb-32 grow bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <ProfileHeader user={user}/>
        {allPlans && allPlans?.length > 0 ? (
          <div className="space-y-8">
            {/* PLAN SELECTOR */}
            <div className="relative bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Your </span>
                  <span className="text-slate-900 dark:text-slate-100">Fitness Plans</span>
                </h2>
                <div className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    Total: {allPlans.length}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {allPlans.map(plan => (
                  <Button 
                    key={plan._id}
                    onClick={() => setSelectedPlanId(plan._id)}
                    className={`font-semibold rounded-xl transition-all shadow-lg ${
                      selectedPlanId === plan._id
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30"
                        : "bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl"
                    }`}
                  >
                    {plan.name}
                    {plan.isActive && (
                      <span className="ml-2 bg-green-500/20 text-green-600 dark:text-green-400 text-xs px-2 py-1 rounded-lg font-bold">
                        ACTIVE
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Plan Details */}
            {currentPlan && (
              <div className="relative bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse shadow-lg shadow-blue-500/50"></div>
                  <h3 className="text-2xl font-bold">
                    <span className="text-slate-900 dark:text-slate-100">Plan: </span>
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{currentPlan.name}</span>
                  </h3>
                </div>

                <Tabs defaultValue='workout' className='w-full'>
                  <TabsList className="mb-8 w-full grid grid-cols-2 bg-slate-100 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-1 h-14">
                    <TabsTrigger
                      value='workout'
                      className="rounded-xl font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 transition-all"
                    >
                      <DumbbellIcon className='mr-2 size-5'/>
                      Workout Plan
                    </TabsTrigger>
                    <TabsTrigger
                      value='diet'
                      className="rounded-xl font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/30 transition-all"
                    >
                      <AppleIcon className='mr-2 size-5'/>
                      Diet Plan
                    </TabsTrigger>
                  </TabsList>

                  {/* Workout Tab content */}
                  <TabsContent value='workout'>
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800/50">
                        <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          Weekly Schedule:
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {currentPlan.workoutPlan.schedule.join(", ")}
                        </span>
                      </div>

                      <Accordion type='multiple' className='space-y-4'>
                        {currentPlan.workoutPlan.exercises.map((exerciseDay, index) => (
                          <AccordionItem 
                            key={index} 
                            value={exerciseDay.day} 
                            className='bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-lg'
                          >
                            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors">
                              <div className="flex justify-between w-full items-center">
                                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                  {exerciseDay.day}
                                </span>
                                <div className="px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50">
                                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                                    {exerciseDay.routines.length} Exercises
                                  </span>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className='pb-6 px-6'>
                              <div className="space-y-4 mt-4">
                                {exerciseDay.routines.map((routine, routineIndex) => (
                                  <div
                                    key={routineIndex}
                                    className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                                  >
                                    <div className="flex justify-between items-start mb-3">
                                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                                        {routine.name}
                                      </h4>
                                      <div className="flex items-center gap-2">
                                        <div className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold shadow-lg">
                                          {routine.sets} SETS
                                        </div>
                                        <div className="px-3 py-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold shadow-lg">
                                          {routine.reps} REPS
                                        </div>
                                      </div>
                                    </div>
                                    {routine.description && (
                                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {routine.description}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </TabsContent>

                  {/* Diet Tab content */}
                  <TabsContent value="diet">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center p-5 bg-green-50 dark:bg-green-950/30 rounded-2xl border border-green-200 dark:border-green-800/50">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          Daily Calorie Target
                        </span>
                        <div className="font-bold text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          {currentPlan.dietPlan.dailyCalories} KCAL
                        </div>
                      </div>

                      <div className="space-y-4">
                        {currentPlan.dietPlan.meals.map((meal, index) => (
                          <div
                            key={index}
                            className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden p-6 shadow-lg hover:shadow-xl transition-shadow"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/50"></div>
                              <h4 className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                {meal.name}
                              </h4>
                            </div>
                            <ul className="space-y-3">
                              {meal.foods.map((food, foodIndex) => (
                                <li
                                  key={foodIndex}
                                  className="flex items-center gap-3 text-slate-700 dark:text-slate-300 p-2 rounded-lg hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-colors"
                                >
                                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs font-bold shadow-lg">
                                    {foodIndex + 1}
                                  </span>
                                  {food}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        ) : (
          <NoFitnessPlan/>
        )}
      </div>
    </section>
  )
}

export default ProfilePage













