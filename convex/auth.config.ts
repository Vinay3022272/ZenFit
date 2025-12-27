import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: "https://dashing-hound-24.clerk.accounts.dev",
      applicationID: "convex",
    },
  ]
} satisfies AuthConfig;