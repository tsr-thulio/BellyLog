/**
 * Profile API Client
 * Helper functions for interacting with the profile API endpoints
 */

export interface ProfileData {
  // Essential Pregnancy Information
  last_period?: Date | string | null
  previous_pregnancies?: number
  conception_type?: string
  pregnancy_type?: string
  number_of_babies?: number

  // Medical History
  pre_existing_conditions?: string[]
  previous_pregnancy_complications?: string[]
  current_complications?: string | null
  medications?: string | null
  food_allergies?: string | null
  medication_allergies?: string | null
  blood_type?: string | null
  has_blood_clot_history?: boolean

  // Lifestyle & Demographics
  age?: number | null
  weight_category?: string | null
  substance_use_history?: string[]
  activity_level?: string | null
  has_exercise_restrictions?: boolean
  exercise_restrictions_details?: string | null
  dietary_restrictions?: string[]
  work_physical_demand?: string | null
  work_chemical_exposure?: boolean
  work_chemical_exposure_details?: string | null
  additional_notes?: string | null

  // Metadata
  profile_completed?: boolean
}

export interface Profile extends ProfileData {
  id: string
  created_at: string
  updated_at: string
}

/**
 * Fetch the authenticated user's profile
 */
export async function getProfile(): Promise<Profile | null> {
  const response = await fetch('/api/profile', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch profile')
  }

  const data = await response.json()
  return data.profile
}

/**
 * Create a new profile for the authenticated user
 */
export async function createProfile(profileData: ProfileData): Promise<Profile> {
  const response = await fetch('/api/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create profile')
  }

  const data = await response.json()
  return data.profile
}

/**
 * Update the authenticated user's profile
 */
export async function updateProfile(profileData: Partial<ProfileData>): Promise<Profile> {
  const response = await fetch('/api/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update profile')
  }

  const data = await response.json()
  return data.profile
}

/**
 * Delete the authenticated user's profile
 */
export async function deleteProfile(): Promise<void> {
  const response = await fetch('/api/profile', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete profile')
  }
}
