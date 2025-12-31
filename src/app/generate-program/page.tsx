"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { vapi } from "@/lib/vapi";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const GenerateProgram = () => {
  const [callActive, setCallActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { user } = useUser();
  const router = useRouter();

  const messageConatinerRef = useRef<HTMLDivElement>(null);

  // SOLUTION to get rid of "Meeting has ended" error
  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = function (msg, ...args) {
      if (
        msg &&
        (msg.includes("Meeting has ended") ||
          (args[0] && args[0].toString().includes("Meeting has ended")))
      ) {
        console.log("Ignoring known error: Meeting has ended");
        return;
      }

      return originalError.call(console, msg, ...args);
    };

    console.warn = function (msg, ...args) {
      if (
        msg &&
        (msg.includes("Ignoring settings for browser") ||
          msg.includes("input processor"))
      ) {
        return;
      }

      return originalWarn.call(console, msg, ...args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  useEffect(() => {
    if (messageConatinerRef.current) {
      messageConatinerRef.current.scrollTop =
        messageConatinerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (callEnded) {
      const redirectTimer = setTimeout(() => {
        router.push("/profile");
      }, 1500);

      return () => clearTimeout(redirectTimer);
    }
  }, [callEnded, router]);

  useEffect(() => {
    const handleCallStart = () => {
      console.log("Call started");
      setConnecting(false);
      setCallActive(true);
      setCallEnded(false);
      setError(null);
    };

    const handleCallEnd = () => {
      console.log("Call ended");
      setCallActive(false);
      setConnecting(false);
      setIsSpeaking(false);
      setCallEnded(true);
    };

    const handleSpeechStart = () => {
      console.log("AI started Speaking");
      setIsSpeaking(true);
    };

    const handleSpeechEnd = () => {
      console.log("AI stopped Speaking");
      setIsSpeaking(false);
    };

    const handleMessage = (message: any) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { content: message.transcript, role: message.role };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const handleError = (error: any) => {
      console.error("Vapi Error Details:", {
        error,
        type: typeof error,
        keys: Object.keys(error || {}),
        message: error?.message,
        stack: error?.stack,
        stringified: JSON.stringify(error)
      });
      
      setConnecting(false);
      setCallActive(false);
      
      let errorMessage = "Failed to connect. Please check your configuration.";
      
      if (!error || Object.keys(error).length === 0) {
        errorMessage = "Connection failed. This might be due to: 1) Network issues, 2) Invalid workflow configuration, 3) API service issues. Please try again in a moment.";
        setError(errorMessage);
        return;
      }
      
      if (error?.type === "transport-error" || JSON.stringify(error).includes("transport")) {
        errorMessage = "Network connection failed. Please check: 1) Your microphone permissions, 2) Your internet connection, 3) Try disabling VPN/firewall if active, 4) Try a different browser.";
      } 
      else if (error?.type === "daily-error" && error?.error?.message?.msg === "Meeting has ended") {
        console.log("Meeting ended normally");
        return;
      }
      else if (error?.error?.message?.message) {
        const apiError = error.error.message.message;
        
        if (apiError.includes("Does Not Exist")) {
          errorMessage = "The Assistant/Workflow ID does not exist. Please check your VAPI configuration in the dashboard and update your .env.local file with the correct Workflow ID.";
        } else if (apiError.includes("rate limit") || apiError.includes("quota")) {
          errorMessage = "Service is temporarily busy due to high demand. Please try again in a few moments.";
        } else {
          errorMessage = apiError;
        }
      } 
      else if (error?.error?.error?.message) {
        errorMessage = error.error.error.message;
      } 
      else if (error?.message) {
        errorMessage = error.message;
      }
      else if (error?.error?.statusCode === 503 || error?.error?.statusCode === 500) {
        errorMessage = "AI service is temporarily unavailable. Please try again in a moment.";
      }
      else if (error?.error?.statusCode === 429) {
        errorMessage = "Service is temporarily busy. Please try again in a few moments.";
      }
      
      setError(errorMessage);
    };

    vapi.on("call-start", handleCallStart);
    vapi.on("call-end", handleCallEnd);
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);
    vapi.on("message", handleMessage);
    vapi.on("error", handleError);

    return () => {
      vapi.off("call-start", handleCallStart);
      vapi.off("call-end", handleCallEnd);
      vapi.off("speech-start", handleSpeechStart);
      vapi.off("speech-end", handleSpeechEnd);
      vapi.off("message", handleMessage);
      vapi.off("error", handleError);
    };
  }, []);

  const toggleCall = async () => {
    if (callActive) {
      vapi.stop();
    } else {
      try {
        setConnecting(true);
        setMessages([]);
        setCallEnded(false);
        setError(null);

        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
          console.log("Microphone access granted");
        } catch (micError) {
          throw new Error("Microphone access denied. Please allow microphone access and try again.");
        }

        const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;
        
        if (!workflowId) {
          throw new Error("NEXT_PUBLIC_VAPI_WORKFLOW_ID is not configured. Please add it to your .env.local file.");
        }
        
        const fullName = user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "There";
        
        console.log("Starting Vapi workflow with ID:", workflowId);
        
        await vapi.start(null!, null!, null!, workflowId, {
          variableValues: {
            full_name: fullName,
            user_id: user?.id,
          }
        });
      } catch (error) {
        console.error("Failed to start call:", error);
        
        const errorMessage = error instanceof Error 
          ? error.message 
          : "Unknown error occurred while starting the call";
        
        setError(errorMessage);
        setConnecting(false);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 text-foreground overflow-hidden pb-6 pt-24">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 h-full max-w-5xl relative z-10">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium">
              ✨ AI Voice Assistant
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">Create Your </span>
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Perfect Plan</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Have a natural conversation with our AI fitness coach to design a personalized workout and nutrition program
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-5 bg-red-50/80 dark:bg-red-950/30 backdrop-blur-xl border border-red-200 dark:border-red-800/50 rounded-2xl shadow-lg">
            <div className="flex items-start gap-3">
              <div className="shrink-0 text-red-600 dark:text-red-400 text-xl">⚠️</div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">Connection Error</h3>
                <p className="text-sm text-red-700 dark:text-red-400 whitespace-pre-line leading-relaxed">{error}</p>
                <p className="text-xs text-red-600/70 dark:text-red-500/70 mt-3">
                  If the issue persists, please contact support.
                </p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors text-xl"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Calling area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* AI ASSISTANT CARD */}
          <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative rounded-3xl shadow-xl">
            <div className="aspect-video flex flex-col items-center justify-center p-8 relative">
              {/* AI voice animation */}
              <div
                className={`absolute inset-0 ${
                  isSpeaking ? "opacity-20" : "opacity-0"
                } transition-opacity duration-300`}
              >
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-center items-center h-24">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`mx-1 w-2 bg-gradient-to-t from-blue-500 to-indigo-500 rounded-full ${
                        isSpeaking ? "animate-sound-wave" : ""
                      }`}
                      style={{
                        animationDelay: `${i * 0.1}s`,
                        height: isSpeaking
                          ? `${Math.random() * 50 + 20}%`
                          : "5%",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* AI IMAGE */}
              <div className="relative size-32 mb-4">
                <div
                  className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-20 rounded-full blur-2xl ${
                    isSpeaking ? "animate-pulse" : ""
                  }`}
                />

                <div className="relative w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 overflow-hidden shadow-2xl">
                  <img
                    src="/ai_ass.jpg"
                    alt="AI Assistant"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">ZenFit AI</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Your Personal Fitness Coach
              </p>

              {/* SPEAKING INDICATOR */}
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm ${
                  isSpeaking 
                    ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50" 
                    : "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSpeaking ? "bg-green-500 animate-pulse shadow-lg shadow-green-500/50" : "bg-slate-400"
                  }`}
                />

                <span className={`text-xs font-semibold ${
                  isSpeaking ? "text-green-700 dark:text-green-400" : "text-slate-600 dark:text-slate-400"
                }`}>
                  {isSpeaking
                    ? "Speaking..."
                    : callActive
                      ? "Listening..."
                      : callEnded
                        ? "Redirecting to profile..."
                        : "Ready to start"}
                </span>
              </div>
            </div>
          </Card>

          {/* User card */}
          <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative rounded-3xl shadow-xl">
            <div className="aspect-video flex flex-col items-center justify-center p-8 relative">
              {/* User Image */}
              <div className="relative size-32 mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-20 rounded-full blur-2xl"></div>
                <img
                  src={user?.imageUrl}
                  alt="User"
                  className="size-full object-cover rounded-full border-2 border-slate-200 dark:border-slate-700 shadow-2xl relative"
                />
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">You</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {user
                  ? (user.firstName + " " + (user.lastName || "")).trim()
                  : "Guest"}
              </p>

              {/* User Ready Text */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 backdrop-blur-sm border border-blue-200 dark:border-blue-800/50">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Ready</span>
              </div>
            </div>
          </Card>
        </div>

        {/* MESSAGE CONTAINER */}
        {messages.length > 0 && (
          <div
            ref={messageConatinerRef}
            className="w-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 mb-8 h-64 overflow-y-auto transition-all duration-300 scroll-smooth shadow-xl"
          >
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className="message-item animate-fadeIn">
                  <div className="font-semibold text-xs mb-2 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${msg.role === "assistant" ? "bg-blue-500" : "bg-indigo-500"}`} />
                    <span className={msg.role === "assistant" ? "text-blue-600 dark:text-blue-400" : "text-indigo-600 dark:text-indigo-400"}>
                      {msg.role === "assistant" ? "ZenFit AI" : "You"}
                    </span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 pl-4 leading-relaxed">{msg.content}</p>
                </div>
              ))}

              {callEnded && (
                <div className="message-item animate-fadeIn">
                  <div className="font-semibold text-xs text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    System
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 pl-4 leading-relaxed">
                    Your fitness program has been created! Redirecting to your profile...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CALL CONTROLS */}
        <div className="w-full flex justify-center gap-4">
          <Button
            className={`w-48 h-16 text-lg font-semibold rounded-2xl shadow-2xl transition-all ${
              callActive
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/30 hover:shadow-red-500/40"
                : callEnded
                  ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-500/30"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30 hover:shadow-blue-500/40"
            } text-white relative overflow-hidden hover:scale-105`}
            onClick={toggleCall}
            disabled={connecting || callEnded}
          >
            {connecting && (
              <span className="absolute inset-0 rounded-2xl animate-ping bg-blue-400/50 opacity-75"></span>
            )}

            <span className="relative z-10">
              {callActive
                ? "End Call"
                : connecting
                  ? "Connecting..."
                  : callEnded
                    ? "View Profile"
                    : "Start Call"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GenerateProgram;










