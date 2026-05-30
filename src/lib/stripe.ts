import Stripe from 'stripe';

/**
 * Check if Stripe is properly configured with a valid secret key.
 * Placeholder/test keys are NOT considered configured.
 */
export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return false;
  // Reject placeholder keys
  if (key === 'sk_test_placeholder' || key.startsWith('sk_test_placeholder')) return false;
  // Must start with sk_test_ or sk_live_
  return key.startsWith('sk_test_') || key.startsWith('sk_live_');
}

/**
 * Initialize Stripe client.
 * Uses the real key if available, otherwise a placeholder (will fail on API calls).
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-12-18.acacia',
});

/**
 * Pricing plan configuration.
 *
 * IMPORTANT: Price IDs must be created in the Stripe Dashboard or via createStripeProducts().
 * The default price IDs below are placeholders and will NOT work until real Stripe
 * products/prices are created.
 */
export const PRICING_PLANS = {
  STUDENT_PRO: {
    name: 'Delegate Pro',
    monthlyPriceId: 'price_1TcuBwRW2clKYAKGNCPpupys',
    yearlyPriceId: 'price_1TcuBwRW2clKYAKGcIOdGi2H',
    monthlyPrice: 11,
    yearlyPrice: 109,
    currency: 'USD',
  },
  TEACHER_PRO: {
    name: 'Director Pro',
    monthlyPriceId: 'price_1Tcu6qRW2clKYAKG7B8SUt4m',
    yearlyPriceId: 'price_1Tcu6qRW2clKYAKGnjIv0PSb',
    monthlyPrice: 29,
    yearlyPrice: 278,
    currency: 'USD',
  },
  SCHOOL_STARTER: {
    name: 'School Starter',
    monthlyPriceId: 'price_1Tcu6rRW2clKYAKGiGsg980R',
    monthlyPrice: 99,
    currency: 'USD',
    maxStudents: 50,
    maxTeachers: 5,
  },
  SCHOOL_PROFESSIONAL: {
    name: 'School Professional',
    monthlyPriceId: 'price_1Tcu6rRW2clKYAKG4hi1CsyG',
    monthlyPrice: 249,
    currency: 'USD',
    maxStudents: 200,
    maxTeachers: 20,
  },
  SCHOOL_ENTERPRISE: {
    name: 'School Enterprise',
    monthlyPriceId: 'price_school_enterprise',
    monthlyPrice: 0, // Custom pricing — contact sales
    currency: 'USD',
    maxStudents: -1, // Unlimited
    maxTeachers: -1,
  },
  CONFERENCE_PAY_PER_EVENT: {
    name: 'Conference Pay-Per-Event',
    priceId: 'price_1Tcu6sRW2clKYAKGgi0IdYx2',
    price: 49,
    currency: 'USD',
  },
  CONFERENCE_ANNUAL: {
    name: 'Conference Annual License',
    yearlyPriceId: 'price_1Tcu6tRW2clKYAKGS0ksISlR',
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

/**
 * Programmatically create all Stripe products and prices.
 * Call this once from an admin script or API to set up the products in Stripe.
 * Returns a map of plan keys to their created price IDs.
 *
 * Requires STRIPE_SECRET_KEY to be configured.
 */
export async function createStripeProducts(): Promise<Record<string, { productId: string; monthlyPriceId?: string; yearlyPriceId?: string; oneTimePriceId?: string }>> {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY environment variable.');
  }

  const results: Record<string, { productId: string; monthlyPriceId?: string; yearlyPriceId?: string; oneTimePriceId?: string }> = {};

  // Student Pro
  const studentProduct = await stripe.products.create({
    name: 'Delegate Pro',
    description: 'Professional MUN tools for student delegates — assessments, research lab, and advanced training.',
  });
  const studentMonthly = await stripe.prices.create({
    product: studentProduct.id,
    unit_amount: 900, // $9.00
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { planKey: 'STUDENT_PRO', billingPeriod: 'monthly' },
  });
  const studentYearly = await stripe.prices.create({
    product: studentProduct.id,
    unit_amount: 8600, // $86.00
    currency: 'usd',
    recurring: { interval: 'year' },
    metadata: { planKey: 'STUDENT_PRO', billingPeriod: 'annual' },
  });
  results.STUDENT_PRO = {
    productId: studentProduct.id,
    monthlyPriceId: studentMonthly.id,
    yearlyPriceId: studentYearly.id,
  };

  // Teacher Pro
  const teacherProduct = await stripe.products.create({
    name: 'Director Pro',
    description: 'Advanced MUN management tools for teachers and directors — school analytics, student tracking, and more.',
  });
  const teacherMonthly = await stripe.prices.create({
    product: teacherProduct.id,
    unit_amount: 2900, // $29.00
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { planKey: 'TEACHER_PRO', billingPeriod: 'monthly' },
  });
  const teacherYearly = await stripe.prices.create({
    product: teacherProduct.id,
    unit_amount: 27800, // $278.00
    currency: 'usd',
    recurring: { interval: 'year' },
    metadata: { planKey: 'TEACHER_PRO', billingPeriod: 'annual' },
  });
  results.TEACHER_PRO = {
    productId: teacherProduct.id,
    monthlyPriceId: teacherMonthly.id,
    yearlyPriceId: teacherYearly.id,
  };

  // School Starter
  const starterProduct = await stripe.products.create({
    name: 'School Starter',
    description: 'MUN platform for schools — up to 50 students and 5 teachers.',
  });
  const starterMonthly = await stripe.prices.create({
    product: starterProduct.id,
    unit_amount: 9900, // $99.00
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { planKey: 'SCHOOL_STARTER', billingPeriod: 'monthly' },
  });
  results.SCHOOL_STARTER = {
    productId: starterProduct.id,
    monthlyPriceId: starterMonthly.id,
  };

  // School Professional
  const proProduct = await stripe.products.create({
    name: 'School Professional',
    description: 'MUN platform for larger schools — up to 200 students and 20 teachers.',
  });
  const proMonthly = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 24900, // $249.00
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: { planKey: 'SCHOOL_PROFESSIONAL', billingPeriod: 'monthly' },
  });
  results.SCHOOL_PROFESSIONAL = {
    productId: proProduct.id,
    monthlyPriceId: proMonthly.id,
  };

  // Conference Pay-Per-Event
  const confProduct = await stripe.products.create({
    name: 'Conference Pay-Per-Event',
    description: 'One MUN conference event with full platform support.',
  });
  const confOneTime = await stripe.prices.create({
    product: confProduct.id,
    unit_amount: 4900, // $49.00
    currency: 'usd',
    metadata: { planKey: 'CONFERENCE_PAY_PER_EVENT', billingPeriod: 'one-time' },
  });
  results.CONFERENCE_PAY_PER_EVENT = {
    productId: confProduct.id,
    oneTimePriceId: confOneTime.id,
  };

  // Conference Annual
  const confAnnualProduct = await stripe.products.create({
    name: 'Conference Annual License',
    description: 'Unlimited MUN conferences for one year.',
  });
  const confAnnualYearly = await stripe.prices.create({
    product: confAnnualProduct.id,
    unit_amount: 39900, // $399.00
    currency: 'usd',
    recurring: { interval: 'year' },
    metadata: { planKey: 'CONFERENCE_ANNUAL', billingPeriod: 'annual' },
  });
  results.CONFERENCE_ANNUAL = {
    productId: confAnnualProduct.id,
    yearlyPriceId: confAnnualYearly.id,
  };

  // School Enterprise is custom pricing — no Stripe price needed
  results.SCHOOL_ENTERPRISE = {
    productId: '', // No product needed for enterprise
  };

  return results;
}
