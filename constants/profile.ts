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
