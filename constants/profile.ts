/**
 * Profile Setup Steps
 * Defines the steps for the profile setup wizard
 */
export const PROFILE_SETUP_STEPS = [
  'Essential Pregnancy Information',
  'Medical History',
  'Lifestyle and Demographics',
] as const

export type ProfileSetupStep = typeof PROFILE_SETUP_STEPS[number]

/**
 * Pregnancy Duration Constants
 * Default gestation periods for pregnancy calculations
 */
export const PREGNANCY_CONSTANTS = {
  // Standard full-term pregnancy duration
  FULL_TERM_WEEKS: 40,
  FULL_TERM_DAYS: 280, // 40 weeks * 7 days
} as const
