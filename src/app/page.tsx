import { SignedIn, SignedOut, SignInButton, SignOutButton } from '@clerk/nextjs'
import React from 'react'

const HomePage = () => {
  return (
    <div>
      HomePage
      
      {/* When user is NOT logged in, show Sign In */}
      <SignedOut>
        <SignInButton />
      </SignedOut>

      {/* When user IS logged in, show Sign Out */}
      <SignedIn>
        <SignOutButton />
      </SignedIn>
    </div>
  )
}

export default HomePage