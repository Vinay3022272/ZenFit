// In any component where user is signed in
"use client"
import { useAuth } from "@clerk/nextjs";
import { Button } from "./ui/button";

export const  TestComponent =( ) => {
  const { getToken } = useAuth();
  
  const checkToken = async () => {
    const token = await getToken({ template: "convex" }); // Explicitly use "convex" template
    console.log("Token:", token);
    
    // Decode to check claims
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log("Token payload:", payload);
      console.log("Issuer:", payload.iss);
      console.log("Audience:", payload.aud);
    }
  };
  
  return <Button onClick={checkToken}>Checkrrt  Token</Button>;
}