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
    
    // override console.error to ignore known errors
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

    // override console.warn to ignore audio processor warnings
    console.warn = function (msg, ...args) {
      if (
        msg &&
        (msg.includes("Ignoring settings for browser") ||
          msg.includes("input processor"))
      ) {
        return; // silently ignore
      }

      return originalWarn.call(console, msg, ...args);
    };

    // restore original handlers on unmount
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // auto-scroll messages
  useEffect(() => {
    if (messageConatinerRef.current) {
      messageConatinerRef.current.scrollTop =
        messageConatinerRef.current.scrollHeight;
    }
  }, [messages]);

  // navigate user to profile page after the call ends
  useEffect(() => {
    if (callEnded) {
      const redirectTimer = setTimeout(() => {
        router.push("/profile");
      }, 1500);

      return () => clearTimeout(redirectTimer);
    }
  }, [callEnded, router]);

  // setup event listeners for vapi
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
      
      // Prevent the UI from getting stuck in "Connecting" state if an error occurs
      setConnecting(false);
      setCallActive(false);
      
      // Parse the error message for better user feedback
      let errorMessage = "Failed to connect. Please check your configuration.";
      
      // Handle empty error objects
      if (!error || Object.keys(error).length === 0) {
        errorMessage = "Connection failed. This might be due to: 1) Network issues, 2) Invalid workflow configuration, 3) API service issues. Please try again in a moment.";
        setError(errorMessage);
        return;
      }
      
      // Check for WebRTC transport errors
      if (error?.type === "transport-error" || JSON.stringify(error).includes("transport")) {
        errorMessage = "Network connection failed. Please check: 1) Your microphone permissions, 2) Your internet connection, 3) Try disabling VPN/firewall if active, 4) Try a different browser.";
      } 
      // Check for daily-co errors (meeting ended)
      else if (error?.type === "daily-error" && error?.error?.message?.msg === "Meeting has ended") {
        // Ignore this error as it's expected when call ends
        console.log("Meeting ended normally");
        return;
      }
      // Check for workflow errors
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
      // Check for HTTP error responses
      else if (error?.error?.statusCode === 503 || error?.error?.statusCode === 500) {
        errorMessage = "AI service is temporarily unavailable. Please try again in a moment.";
      }
      else if (error?.error?.statusCode === 429) {
        errorMessage = "Service is temporarily busy. Please try again in a few moments.";
      }
      
      setError(errorMessage);
    };

    // Attach listeners
    vapi.on("call-start", handleCallStart);
    vapi.on("call-end", handleCallEnd);
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);
    vapi.on("message", handleMessage);
    vapi.on("error", handleError);

    // cleanup event listeners
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

        // Check microphone permissions first
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop()); // Release immediately
          console.log("Microphone access granted");
        } catch (micError) {
          throw new Error("Microphone access denied. Please allow microphone access and try again.");
        }

        const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;
        
        // Validation
        if (!workflowId) {
          throw new Error("NEXT_PUBLIC_VAPI_WORKFLOW_ID is not configured. Please add it to your .env.local file.");
        }
        
        const fullName = user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "There";
        
        console.log("Starting Vapi workflow with ID:", workflowId);
        
        // IMPORTANT: Workflows must be passed as the 4th parameter to vapi.start()
        // Syntax: vapi.start(assistantId, assistantOverrides, transcriber, workflowId)
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
    <div className="flex flex-col min-h-screen text-foreground overflow-hidden pb-6 pt-24">
      <div className="container mx-auto px-4 h-full max-w-5xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-mono">
            <span>Generate Your </span>
            <span className="text-primary uppercase">Fitness Program</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Have a voice conversation with our AI assistant to create your
            personalized plan
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
            <div className="flex items-start gap-3">
              <div className="shrink-0 text-destructive">⚠️</div>
              <div className="flex-1">
                <h3 className="font-semibold text-destructive mb-1">Connection Error</h3>
                <p className="text-sm text-destructive/90 whitespace-pre-line">{error}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  If the issue persists, please contact support.
                </p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="text-destructive hover:text-destructive/80"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Calling area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* AI ASSISTANT CARD */}
          <Card className="bg-card/90 backdrop-blur-sm border border-border overflow-hidden relative">
            <div className="aspect-video flex flex-col items-center justify-center p-6 relative">
              {/* AI voice animation */}
              <div
                className={`absolute inset-0 ${
                  isSpeaking ? "opacity-30" : "opacity-0"
                } transition-opacity duration-300`}
              >
                {/* Voice wave animation when speaking */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-center items-center h-20">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`mx-1 h-16 w-1 bg-primary rounded-full ${
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
                  className={`absolute inset-0 bg-primary opacity-10 rounded-full blur-lg ${
                    isSpeaking ? "animate-pulse" : ""
                  }`}
                />

                <div className="relative w-full h-full rounded-full bg-card flex items-center justify-center border border-border overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-b from-primary/10 to-secondary/10"></div>
                  <img
                    src="/ai-avatar.png"
                    alt="AI Assistant"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <h2 className="text-xl font-bold text-foreground">ZenFit AI</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Fitness & Diet Coach
              </p>

              {/* SPEAKING INDICATOR */}
              <div
                className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border ${
                  isSpeaking ? "border-primary" : ""
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSpeaking ? "bg-primary animate-pulse" : "bg-muted"
                  }`}
                />

                <span className="text-xs text-muted-foreground">
                  {isSpeaking
                    ? "Speaking..."
                    : callActive
                      ? "Listening..."
                      : callEnded
                        ? "Redirecting to profile..."
                        : "Waiting..."}
                </span>
              </div>
            </div>
          </Card>

          {/* User card */}
          <Card className="bg-card/90 backdrop-blur-sm border overflow-hidden relative">
            <div className="aspect-video flex flex-col items-center justify-center p-6 relative">
              {/* User Image */}
              <div className="relative size-32 mb-4">
                <img
                  src={user?.imageUrl}
                  alt="User"
                  className="size-full object-cover rounded-full"
                />
              </div>

              <h2 className="text-xl font-bold text-foreground">You</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {user
                  ? (user.firstName + " " + (user.lastName || "")).trim()
                  : "Guest"}
              </p>

              {/* User Ready Text */}
              <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-card border">
                <div className="w-2 h-2 rounded-full bg-muted" />
                <span className="text-xs text-muted-foreground">Ready</span>
              </div>
            </div>
          </Card>
        </div>

        {/* MESSAGE CONTAINER */}
        {messages.length > 0 && (
          <div
            ref={messageConatinerRef}
            className="w-full bg-card/90 backdrop-blur-sm border border-border rounded-xl p-4 mb-8 h-64 overflow-y-auto transition-all duration-300 scroll-smooth"
          >
            <div className="space-y-3">
              {messages.map((msg, index) => (
                <div key={index} className="message-item animate-fadeIn">
                  <div className="font-semibold text-xs text-muted-foreground mb-1">
                    {msg.role === "assistant" ? "ZenFit AI" : "You"}:
                  </div>
                  <p className="text-foreground">{msg.content}</p>
                </div>
              ))}

              {callEnded && (
                <div className="message-item animate-fadeIn">
                  <div className="font-semibold text-xs text-primary mb-1">System:</div>
                  <p className="text-foreground">
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
            className={`w-40 text-xl rounded-3xl ${
              callActive
                ? "bg-destructive hover:bg-destructive/90"
                : callEnded
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-primary hover:bg-primary/90"
            } text-white relative`}
            onClick={toggleCall}
            disabled={connecting || callEnded}
          >
            {connecting && (
              <span className="absolute inset-0 rounded-full animate-ping bg-primary/50 opacity-75"></span>
            )}

            <span>
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