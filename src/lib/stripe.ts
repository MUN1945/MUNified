import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-12-18.acacia',
});

export const PRICING_PLANS = {
  STUDENT_PRO: {
    name: 'Delegate Pro',
    monthlyPriceId: 'price_student_monthly',
    yearlyPriceId: 'price_student_yearly',
    monthlyPrice: 9,
    yearlyPrice: 86,
    currency: 'USD',
  },
  TEACHER_PRO: {
    name: 'Director Pro',
    monthlyPriceId: 'price_teacher_monthly',
    yearlyPriceId: 'price_teacher_yearly',
    monthlyPrice: 29,
    yearlyPrice: 278,
    currency: 'USD',
  },
  SCHOOL_STARTER: {
    name: 'School Starter',
    monthlyPriceId: 'price_school_starter_monthly',
    monthlyPrice: 99,
    currency: 'USD',
    maxStudents: 50,
    maxTeachers: 5,
  },
  SCHOOL_PROFESSIONAL: {
    name: 'School Professional',
    monthlyPriceId: 'price_school_pro_monthly',
    monthlyPrice: 249,
    currency: 'USD',
    maxStudents: 200,
    maxTeachers: 20,
  },
  SCHOOL_ENTERPRISE: {
    name: 'School Enterprise',
    monthlyPriceId: 'price_school_enterprise',
    monthlyPrice: 0, // Custom
    currency: 'USD',
    maxStudents: -1, // Unlimited
    maxTeachers: -1,
  },
  CONFERENCE_PAY_PER_EVENT: {
    name: 'Conference Pay-Per-Event',
    priceId: 'price_conference_single',
    price: 49,
    currency: 'USD',
  },
  CONFERENCE_ANNUAL: {
    name: 'Conference Annual License',
    yearlyPriceId: 'price_conference_annual',
    yearlyPrice: 399,
    currency: 'USD',
  },
} as const;

export type PricingPlanKey = keyof typeof PRICING_PLANS;

/**
 * Get the Stripe price ID for a given plan and billing period
 */
export function getPriceId(planKey: PricingPlanKey, billingPeriod: 'monthly' | 'annual'): string | null {
  const plan = PRICING_PLANS[planKey];
  if (!plan) return null;

  if ('monthlyPriceId' in plan && billingPeriod === 'monthly') {
    return plan.monthlyPriceId;
  }
  if ('yearlyPriceId' in plan && billingPeriod === 'annual') {
    return plan.yearlyPriceId;
  }
  if ('priceId' in plan) {
    return plan.priceId;
  }
  // School plans are monthly only
  if ('monthlyPriceId' in plan) {
    return plan.monthlyPriceId;
  }
  return null;
}

/**
 * Get the display price for a plan and billing period
 */
export function getDisplayPrice(planKey: PricingPlanKey, billingPeriod: 'monthly' | 'annual'): { price: number; period: string } | null {
  const plan = PRICING_PLANS[planKey];
  if (!plan) return null;

  if (planKey === 'SCHOOL_ENTERPRISE') {
    return { price: 0, period: 'custom' };
  }

  if (planKey === 'CONFERENCE_PAY_PER_EVENT') {
    return { price: plan.price, period: 'one-time' };
  }

  if (planKey === 'CONFERENCE_ANNUAL') {
    return { price: plan.yearlyPrice, period: '/year' };
  }

  if (billingPeriod === 'annual' && 'yearlyPrice' in plan) {
    return { price: plan.yearlyPrice, period: '/year' };
  }

  if ('monthlyPrice' in plan) {
    return { price: plan.monthlyPrice, period: '/month' };
  }

  return null;
}
