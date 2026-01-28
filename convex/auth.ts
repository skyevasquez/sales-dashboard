import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { query, action } from "./_generated/server";
import { DataModel } from "./_generated/dataModel";
import { components } from "./_generated/api";
import { betterAuth } from "better-auth/minimal";
import { Resend } from "resend";
import authConfig from "./auth.config";
import { v } from "convex/values";

const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.FROM_EMAIL ?? "noreply@yourdomain.com";

export const authComponent = createClient<DataModel>(components.betterAuth);

// Initialize Resend if API key is available
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url, token }) => {
        if (!resend) {
          console.error("Resend not configured. Email would have been sent to:", user.email);
          return;
        }
        await resend.emails.send({
          from: fromEmail,
          to: user.email,
          subject: "Reset your password",
          html: `
            <h1>Reset your password</h1>
            <p>Click the link below to reset your password:</p>
            <a href="${url}">Reset password</a>
            <p>If you didn't request this, you can ignore this email.</p>
          `,
        });
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url, token }) => {
        if (!resend) {
          console.error("Resend not configured. Email would have been sent to:", user.email);
          return;
        }
        await resend.emails.send({
          from: fromEmail,
          to: user.email,
          subject: "Verify your email",
          html: `
            <h1>Verify your email</h1>
            <p>Click the link below to verify your email address:</p>
            <a href="${url}">Verify email</a>
            <p>If you didn't request this, you can ignore this email.</p>
          `,
        });
      },
    },
    plugins: [convex({ authConfig })],
  });
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});

// Send verification email action
export const sendVerificationEmail = action({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    if (!resend) {
      throw new Error("Email service not configured");
    }
    // This will be handled by Better Auth
    return { success: true };
  },
});
