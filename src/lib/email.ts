import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM_ADDRESS = "DiplomatiQ <noreply@diplomatiq.io>"

// DiplomatiQ Brand Colors
const COLORS = {
  navy: "#0D1B2A",
  gold: "#D4A843",
  teal: "#0A7E8C",
  white: "#FFFFFF",
  lightGray: "#F8F9FA",
  darkGray: "#4A5568",
  mediumGray: "#E2E8F0",
} as const

function baseEmailStyles(): string {
  return `
    <style>
      body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: ${COLORS.lightGray}; }
      .email-wrapper { width: 100%; background-color: ${COLORS.lightGray}; padding: 40px 0; }
      .email-container { max-width: 600px; margin: 0 auto; background-color: ${COLORS.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
      .email-header { background: linear-gradient(135deg, ${COLORS.navy} 0%, #1a2d42 100%); padding: 32px 40px; text-align: center; }
      .email-header h1 { color: ${COLORS.white}; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
      .email-header .logo-accent { color: ${COLORS.gold}; }
      .email-header .subtitle { color: rgba(255,255,255,0.6); font-size: 14px; margin-top: 8px; }
      .email-body { padding: 40px; }
      .email-body p { color: ${COLORS.darkGray}; font-size: 16px; line-height: 1.6; margin: 0 0 16px; }
      .email-body .greeting { font-size: 18px; font-weight: 600; color: ${COLORS.navy}; }
      .cta-button { display: inline-block; background: linear-gradient(135deg, ${COLORS.gold} 0%, #e0bc6a 100%); color: ${COLORS.navy}; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 16px; margin: 16px 0; }
      .cta-button:hover { opacity: 0.9; }
      .info-box { background-color: ${COLORS.lightGray}; border-left: 4px solid ${COLORS.teal}; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
      .info-box p { margin: 0; font-size: 14px; color: ${COLORS.darkGray}; }
      .warning-box { background-color: #FFF8E1; border-left: 4px solid ${COLORS.gold}; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
      .warning-box p { margin: 0; font-size: 14px; color: ${COLORS.darkGray}; }
      .alert-box { background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
      .alert-box p { margin: 0; font-size: 14px; color: ${COLORS.darkGray}; }
      .divider { border: none; border-top: 1px solid ${COLORS.mediumGray}; margin: 24px 0; }
      .email-footer { background-color: ${COLORS.navy}; padding: 24px 40px; text-align: center; }
      .email-footer p { color: rgba(255,255,255,0.5); font-size: 12px; margin: 0 0 4px; }
      .email-footer a { color: ${COLORS.gold}; text-decoration: none; }
      .trial-badge { display: inline-block; background: linear-gradient(135deg, ${COLORS.teal} 0%, #0a9eac 100%); color: ${COLORS.white}; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    </style>
  `
}

function emailWrapper(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseEmailStyles()}
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-container">
          ${content}
          <div class="email-footer">
            <p>DiplomatiQ &mdash; The Operating System for Model United Nations</p>
            <p><a href="https://diplomatiq.io">diplomatiq.io</a> &bull; <a href="mailto:support@diplomatiq.io">support@diplomatiq.io</a></p>
            <p style="margin-top: 8px; font-size: 11px;">If you did not expect this email, please disregard it.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Send a verification email with a link to verify the user's email address.
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationUrl: string
): Promise<void> {
  const html = emailWrapper(`
    <div class="email-header">
      <h1>Diplomati<span class="logo-accent">Q</span></h1>
      <div class="subtitle">Verify Your Email Address</div>
    </div>
    <div class="email-body">
      <p class="greeting">Hello, ${name}!</p>
      <p>Thank you for joining DiplomatiQ. To complete your registration and activate your account, please verify your email address by clicking the button below.</p>
      <div style="text-align: center;">
        <a href="${verificationUrl}" class="cta-button">Verify Email Address</a>
      </div>
      <div class="info-box">
        <p><strong>This verification link expires in 24 hours.</strong> If it expires, you can request a new one from your account settings.</p>
      </div>
      <p>If the button above doesn't work, copy and paste the following URL into your browser:</p>
      <p style="word-break: break-all; font-size: 13px; color: ${COLORS.teal};">${verificationUrl}</p>
    </div>
  `)

  try {
    if (!resend) {
      console.warn("[EMAIL] Resend API key not configured. Skipping verification email.")
      return
    }
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: "DiplomatiQ — Verify Your Email",
      html,
    })
  } catch (error) {
    console.error("[EMAIL] Failed to send verification email:", error)
    throw error
  }
}

/**
 * Send a password reset email with a secure link.
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
): Promise<void> {
  const html = emailWrapper(`
    <div class="email-header">
      <h1>Diplomati<span class="logo-accent">Q</span></h1>
      <div class="subtitle">Password Reset Request</div>
    </div>
    <div class="email-body">
      <p class="greeting">Hello, ${name}</p>
      <p>We received a request to reset your DiplomatiQ account password. Click the button below to create a new password:</p>
      <div style="text-align: center;">
        <a href="${resetUrl}" class="cta-button">Reset Password</a>
      </div>
      <div class="warning-box">
        <p><strong>This link expires in 1 hour.</strong> If you didn't request a password reset, you can safely ignore this email &mdash; your account is secure.</p>
      </div>
      <p>If the button above doesn't work, copy and paste the following URL into your browser:</p>
      <p style="word-break: break-all; font-size: 13px; color: ${COLORS.teal};">${resetUrl}</p>
    </div>
  `)

  try {
    if (!resend) {
      console.warn("[EMAIL] Resend API key not configured. Skipping password reset email.")
      return
    }
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: "DiplomatiQ — Reset Your Password",
      html,
    })
  } catch (error) {
    console.error("[EMAIL] Failed to send password reset email:", error)
    throw error
  }
}

/**
 * Send a welcome email after registration, mentioning the 24-hour trial.
 */
export async function sendWelcomeEmail(
  email: string,
  name: string,
  role: string
): Promise<void> {
  const roleLabel = role
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())

  const html = emailWrapper(`
    <div class="email-header">
      <h1>Diplomati<span class="logo-accent">Q</span></h1>
      <div class="subtitle">Welcome to the Platform</div>
    </div>
    <div class="email-body">
      <p class="greeting">Welcome, ${name}! 🎉</p>
      <p>Your DiplomatiQ account has been created as a <strong>${roleLabel}</strong>. You're now part of the world's leading platform for Model United Nations training and conferences.</p>
      <div style="text-align: center; margin: 24px 0;">
        <span class="trial-badge">24-Hour Free Trial Activated</span>
      </div>
      <p>Your 24-hour trial gives you restricted access to DiplomatiQ features, including:</p>
      <ul style="color: ${COLORS.darkGray}; padding-left: 20px; line-height: 1.8;">
        <li>AI-powered MUN training &amp; simulations</li>
        <li>Diagnostic skill assessments</li>
        <li>Research &amp; position paper tools</li>
        <li>Delegate profile &amp; XP tracking</li>
        <li>Conference preparation resources</li>
      </ul>
      <hr class="divider" />
      <div class="info-box">
        <p><strong>Next Steps:</strong> Complete your profile, take the diagnostic assessment, and start your first training module to earn XP and climb the ranks!</p>
      </div>
    </div>
  `)

  try {
    if (!resend) {
      console.warn("[EMAIL] Resend API key not configured. Skipping welcome email.")
      return
    }
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: "Welcome to DiplomatiQ — Your 24-Hour Trial Has Started!",
      html,
    })
  } catch (error) {
    console.error("[EMAIL] Failed to send welcome email:", error)
    throw error
  }
}

/**
 * Send a subscription status change notification.
 */
export async function sendSubscriptionNotification(
  email: string,
  name: string,
  type: "trial_started" | "trial_ending" | "trial_expired" | "upgraded" | "downgraded" | "cancelled" | "payment_failed" | "payment_success",
  details?: string
): Promise<void> {
  const subjects: Record<typeof type, string> = {
    trial_started: "DiplomatiQ — Your Free Trial Has Started",
    trial_ending: "DiplomatiQ — Your Trial Is Ending Soon",
    trial_expired: "DiplomatiQ — Your Trial Has Expired",
    upgraded: "DiplomatiQ — Subscription Upgraded",
    downgraded: "DiplomatiQ — Subscription Changed",
    cancelled: "DiplomatiQ — Subscription Cancelled",
    payment_failed: "DiplomatiQ — Payment Failed",
    payment_success: "DiplomatiQ — Payment Confirmed",
  }

  const bodies: Record<typeof type, string> = {
    trial_started: `<p>Your 24-hour free trial is now active! You have restricted access to basic features during the trial period.</p>`,
    trial_ending: `<p>Your 24-hour trial is ending soon. Upgrade now to get full access to all features and continue your diplomatic journey.</p>`,
    trial_expired: `<p>Your free trial has expired. Upgrade to a paid plan to regain full access to DiplomatiQ's features and continue your progress.</p>`,
    upgraded: `<p>Great news! Your subscription has been upgraded. You now have access to additional features and resources.</p>`,
    downgraded: `<p>Your subscription plan has changed. Some features may be limited based on your new plan.</p>`,
    cancelled: `<p>Your subscription has been cancelled. You'll retain access until the end of your current billing period.</p>`,
    payment_failed: `<p>We were unable to process your payment. Please update your billing information to avoid service interruption.</p>`,
    payment_success: `<p>Your payment has been processed successfully. Your subscription is active and up to date.</p>`,
  }

  const html = emailWrapper(`
    <div class="email-header">
      <h1>Diplomati<span class="logo-accent">Q</span></h1>
      <div class="subtitle">Subscription Update</div>
    </div>
    <div class="email-body">
      <p class="greeting">Hello, ${name}</p>
      ${bodies[type]}
      ${details ? `<div class="info-box"><p>${details}</p></div>` : ""}
      <hr class="divider" />
      <p style="font-size: 14px;">If you have any questions about your subscription, feel free to contact our support team.</p>
    </div>
  `)

  try {
    if (!resend) {
      console.warn("[EMAIL] Resend API key not configured. Skipping subscription notification email.")
      return
    }
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: subjects[type],
      html,
    })
  } catch (error) {
    console.error("[EMAIL] Failed to send subscription notification email:", error)
    throw error
  }
}

/**
 * Send a security alert email (e.g., suspicious login, password change).
 */
export async function sendSecurityAlert(
  email: string,
  name: string,
  alertType: "suspicious_login" | "password_changed" | "account_locked" | "new_device" | "login_from_new_location",
  details?: string
): Promise<void> {
  const subjects: Record<typeof alertType, string> = {
    suspicious_login: "DiplomatiQ — Suspicious Login Activity Detected",
    password_changed: "DiplomatiQ — Your Password Was Changed",
    account_locked: "DiplomatiQ — Account Locked for Security",
    new_device: "DiplomatiQ — New Device Sign-In Detected",
    login_from_new_location: "DiplomatiQ — Sign-In from New Location",
  }

  const bodies: Record<typeof alertType, string> = {
    suspicious_login: `<p>We detected suspicious login activity on your DiplomatiQ account. If this wasn't you, please secure your account immediately.</p>`,
    password_changed: `<p>Your DiplomatiQ account password was recently changed. If you made this change, no further action is needed.</p>`,
    account_locked: `<p>Your DiplomatiQ account has been temporarily locked due to multiple failed login attempts. Please wait before trying again or reset your password.</p>`,
    new_device: `<p>Your DiplomatiQ account was signed in from a new device. If this was you, no action is needed.</p>`,
    login_from_new_location: `<p>Your DiplomatiQ account was accessed from a new location. If this was you, no action is needed.</p>`,
  }

  const html = emailWrapper(`
    <div class="email-header">
      <h1>Diplomati<span class="logo-accent">Q</span></h1>
      <div class="subtitle">Security Alert</div>
    </div>
    <div class="email-body">
      <p class="greeting">Hello, ${name}</p>
      ${bodies[alertType]}
      <div class="alert-box">
        <p><strong>Security Notice:</strong> ${details || "If you did not initiate this action, please change your password immediately and contact our support team."}</p>
      </div>
      <hr class="divider" />
      <p style="font-size: 14px;">For your security, we recommend enabling two-factor authentication on your account and using a strong, unique password.</p>
    </div>
  `)

  try {
    if (!resend) {
      console.warn("[EMAIL] Resend API key not configured. Skipping security alert email.")
      return
    }
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: subjects[alertType],
      html,
    })
  } catch (error) {
    console.error("[EMAIL] Failed to send security alert email:", error)
    throw error
  }
}
