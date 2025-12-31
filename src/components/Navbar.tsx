"use client"
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { DumbbellIcon, HomeIcon, UserIcon, ZapIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'

const Navbar = () => {
  const {isSignedIn} = useUser()
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 py-4">
      <div className="container mx-auto flex items-center justify-between px-4">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:shadow-blue-500/30 transition-all">
            <ZapIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">
            Zen<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Fit</span>.ai
          </span>
        </Link>

        {/* NAVIGATION  */}
        <nav className="flex items-center gap-6">
          {isSignedIn ? (
            <>
              <Link
                href="/"
                className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <HomeIcon size={18} />
                <span>Home</span>
              </Link>

              <Link
                href="/generate-program"
                className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <DumbbellIcon size={18} />
                <span>Generate</span>
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <UserIcon size={18} />
                <span>Profile</span>
              </Link>
              
              <Button
                asChild
                className="ml-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
              >
                <Link href="/generate-program">Get Started</Link>
              </Button>
              
              <UserButton />
            </>
          ) : (
            <>
              <SignInButton>
                <Button 
                  variant="outline"
                  className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-xl"
                >
                  Sign In
                </Button>
              </SignInButton>

              <SignUpButton>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all">
                  Sign Up
                </Button>
              </SignUpButton>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar












