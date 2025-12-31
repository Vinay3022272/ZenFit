import { httpRouter } from "convex/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { GoogleGenAI } from "@google/genai";

const http = httpRouter();

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

// Timeout configuration (25 seconds to stay under Vapi's 30s limit)
const TIMEOUT_MS = 25000;

// Clerk webhook handler
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
    }

    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    if (!svix_id || !svix_signature || !svix_timestamp) {
      return new Response("No svix headers found", {
        status: 400,
      });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error occurred", { status: 400 });
    }

    const eventType = evt.type;

    if (eventType === "user.created") {
      const { id, first_name, last_name, image_url, email_addresses } =
        evt.data;

      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await ctx.runMutation(api.users.syncUser, {
          email,
          name,
          image: image_url,
          clerkId: id,
        });
      } catch (error) {
        console.log("Error creating user:", error);
        return new Response("Error creating user", { status: 500 });
      }
    }

    if (eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;

      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await ctx.runMutation(api.users.updateUser, {
          clerkId: id,
          email,
          name,
          image: image_url,
        });
      } catch (error) {
        console.log("Error updating user:", error);
        return new Response("Error updating user", { status: 500 });
      }
    }

    return new Response("Webhooks processed successfully", { status: 200 });
  }),
});

// Validate and fix workout plan to ensure it has proper numeric types
function validateWorkoutPlan(plan: any) {
  const validatedPlan = {
    schedule: plan.schedule,
    exercises: plan.exercises.map((exercise: any) => ({
      day: exercise.day,
      routines: exercise.routines.map((routine: any) => ({
        name: routine.name,
        sets:
          typeof routine.sets === "number"
            ? routine.sets
            : parseInt(routine.sets) || 1,
        reps:
          typeof routine.reps === "number"
            ? routine.reps
            : parseInt(routine.reps) || 10,
      })),
    })),
  };
  return validatedPlan;
}

// Validate diet plan to ensure it strictly follows schema
function validateDietPlan(plan: any) {
  const validatedPlan = {
    dailyCalories:
      typeof plan.dailyCalories === "number"
        ? plan.dailyCalories
        : parseInt(plan.dailyCalories) || 2000,
    meals: plan.meals.map((meal: any) => ({
      name: meal.name,
      foods: meal.foods,
    })),
  };
  return validatedPlan;
}

// Helper function to create timeout promise
function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(
      () =>
        reject(new Error("Request timeout - processing is taking too long")),
      ms
    )
  );
}

// Helper function to retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit =
        error?.message?.includes("429") ||
        error?.message?.includes("quota") ||
        error?.message?.includes("Too Many Requests");

      // If it's the last retry or not a rate limit error, throw
      if (i === maxRetries - 1 || !isRateLimit) {
        throw error;
      }

      // Extract retry delay from error if available
      const retryMatch = error?.message?.match(/retry in (\d+(?:\.\d+)?)/);
      const suggestedDelay = retryMatch
        ? parseFloat(retryMatch[1]) * 1000
        : null;

      // Use suggested delay or exponential backoff
      const delay = suggestedDelay || baseDelay * Math.pow(2, i);

      console.log(
        `Rate limit hit, retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("Max retries exceeded");
}

// Main logic for generating fitness plan
async function generateFitnessPlan(ctx: any, payload: any) {
  const {
    user_id,
    age,
    height,
    weight,
    injuries,
    workout_days,
    fitness_goal,
    fitness_level,
    dietary_restrictions,
  } = payload;

  console.log("Received payload:", payload);

  // Validate required fields
  if (!user_id) {
    throw new Error("user_id is required");
  }

  const workoutPrompt = `You are an experienced fitness coach creating a personalized workout plan based on:
  Age: ${age}
  Height: ${height}
  Weight: ${weight}
  Injuries or limitations: ${injuries || "None"}
  Available days for workout: ${workout_days}
  Fitness goal: ${fitness_goal}
  Fitness level: ${fitness_level}
  
  As a professional coach:
  - Consider muscle group splits to avoid overtraining the same muscles on consecutive days
  - Design exercises that match the fitness level and account for any injuries
  - Structure the workouts to specifically target the user's fitness goal
  
  CRITICAL SCHEMA INSTRUCTIONS:
  - Your output MUST contain ONLY the fields specified below, NO ADDITIONAL FIELDS
  - "sets" and "reps" MUST ALWAYS be NUMBERS, never strings
  - For example: "sets": 3, "reps": 10
  - Do NOT use text like "reps": "As many as possible" or "reps": "To failure"
  - Instead use specific numbers like "reps": 12 or "reps": 15
  - For cardio, use "sets": 1, "reps": 1 or another appropriate number
  - NEVER include strings for numerical fields
  - NEVER add extra fields not shown in the example below
  
  Return a JSON object with this EXACT structure:
  {
    "schedule": ["Monday", "Wednesday", "Friday"],
    "exercises": [
      {
        "day": "Monday",
        "routines": [
          {
            "name": "Exercise Name",
            "sets": 3,
            "reps": 10
          }
        ]
      }
    ]
  }
  
  DO NOT add any fields that are not in this example. Your response must be a valid JSON object with no additional text.`;

  console.log("Generating workout plan...");
  const workoutResult = await retryWithBackoff(() =>
    genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: workoutPrompt,
      config: {
        temperature: 0.4,
        topP: 0.9,
        responseMimeType: "application/json",
      },
    })
  );
   console.log("workout: ",workoutResult.text);
  const workoutPlanText = workoutResult.text; // ✅ CORRECT: Property access

  // Validate the workout plan from AI
  let workoutPlan = JSON.parse(workoutPlanText!);
  workoutPlan = validateWorkoutPlan(workoutPlan);
  console.log("Workout plan generated successfully");

  const dietPrompt = `You are an experienced nutrition coach creating a personalized diet plan based on:
    Age: ${age}
    Height: ${height}
    Weight: ${weight}
    Fitness goal: ${fitness_goal}
    Dietary restrictions: ${dietary_restrictions || "None"}
    
    As a professional nutrition coach:
    - Calculate appropriate daily calorie intake based on the person's stats and goals
    - Create a balanced meal plan with proper macronutrient distribution
    - Include a variety of nutrient-dense foods while respecting dietary restrictions
    - Consider meal timing around workouts for optimal performance and recovery
    
    CRITICAL SCHEMA INSTRUCTIONS:
    - Your output MUST contain ONLY the fields specified below, NO ADDITIONAL FIELDS
    - "dailyCalories" MUST be a NUMBER, not a string
    - DO NOT add fields like "supplements", "macros", "notes", or ANYTHING else
    - ONLY include the EXACT fields shown in the example below
    - Each meal should include ONLY a "name" and "foods" array

    Return a JSON object with this EXACT structure and no other fields:
    {
      "dailyCalories": 2000,
      "meals": [
        {
          "name": "Breakfast",
          "foods": ["Oatmeal with berries", "Greek yogurt", "Black coffee"]
        },
        {
          "name": "Lunch",
          "foods": ["Grilled chicken salad", "Whole grain bread", "Water"]
        }
      ]
    }
    
    DO NOT add any fields that are not in this example. Your response must be a valid JSON object with no additional text.`;

  console.log("Generating diet plan...");
  const dietResult = await retryWithBackoff(() =>
    genAI.models.generateContent({
    
    model: "gemini-3-flash-preview",
      contents: dietPrompt,
      config: {
        temperature: 0.4,
        topP: 0.9,
        responseMimeType: "application/json",
      },
    })
  );
 console.log("diet: ",dietResult.text);
  
  const dietPlanText = dietResult.text; 

  // Validate the diet plan from AI
  let dietPlan = JSON.parse(dietPlanText!);
  dietPlan = validateDietPlan(dietPlan);
  console.log("Diet plan generated successfully");

  // Save to Convex database
  console.log("Saving plan to database...");
  const planId = await ctx.runMutation(api.plans.createPlan, {
    userId: user_id,
    dietPlan,
    isActive: true,
    workoutPlan,
    name: `${fitness_goal} Plan - ${new Date().toLocaleDateString()}`,
  });

  console.log("Successfully created plan:", planId);

  return {
    planId,
    workoutPlan,
    dietPlan,
  };
}

// Vapi webhook handler for generating fitness programs
http.route({
  path: "/vapi/generate-program",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await request.json();

      // Race between the actual work and timeout
      const result = await Promise.race([
        generateFitnessPlan(ctx, payload),
        createTimeout(TIMEOUT_MS),
      ]);

      return new Response(
        JSON.stringify({
          success: true,
          data: result,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Error generating fitness plan:", error);

      // Determine error type for better response
      const isTimeout =
        error instanceof Error && error.message.includes("timeout");
      const isAPIDisabled =
        error instanceof Error && error.message.includes("SERVICE_DISABLED");
      const isRateLimit =
        error instanceof Error &&
        (error.message.includes("429") ||
          error.message.includes("quota") ||
          error.message.includes("Too Many Requests"));

      let errorMessage = error instanceof Error ? error.message : String(error);
      let statusCode = 500;

      if (isTimeout) {
        errorMessage =
          "Request timed out. The fitness plan generation is taking too long. Please try again.";
        statusCode = 504;
      } else if (isAPIDisabled) {
        errorMessage =
          "AI service is not properly configured. Please contact support.";
        statusCode = 503;
      } else if (isRateLimit) {
        errorMessage =
          "Service is temporarily busy. Please try again in a few moments.";
        statusCode = 429;
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          errorType: isTimeout
            ? "timeout"
            : isAPIDisabled
              ? "service_disabled"
              : isRateLimit
                ? "rate_limit"
                : "unknown",
        }),
        {
          status: statusCode,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

export default http;
