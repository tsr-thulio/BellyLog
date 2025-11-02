export enum ConceptionType {
  NATURAL = 'Natural Conception',
  IUI = 'IUI (Intrauterine Insemination)',
  IVF = 'IVF (In Vitro Fertilization)',
  DONOR_EGG = 'Donor Egg',
  DONOR_SPERM = 'Donor Sperm',
  DONOR_EMBRYO = 'Donor Embryo',
  OTHER = 'Other/Prefer not to say',
}

export enum PregnancyType {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
}

export enum PreExistingCondition {
  DIABETES = 'Diabetes',
  HYPERTENSION = 'Hypertension',
  THYROID_DISORDERS = 'Thyroid Disorders',
  AUTOIMMUNE_DISEASES = 'Autoimmune Diseases',
  HEART_CONDITIONS = 'Heart Conditions',
  KIDNEY_DISEASE = 'Kidney Disease',
}

export enum PregnancyComplication {
  PREECLAMPSIA = 'Preeclampsia',
  GESTATIONAL_DIABETES = 'Gestational Diabetes',
  PREMATURE_BIRTH = 'Premature Birth',
  MISCARRIAGES = 'Miscarriages',
  STILLBIRTH = 'Stillbirth',
  POSTPARTUM_HEMORRHAGE = 'Postpartum Hemorrhage',
}

export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
  UNKNOWN = 'Unknown',
}

export interface EssentialPregnancyInfo {
  lastPeriod: Date | null
  previousPregnancies: number
  conceptionType: ConceptionType | ''
  pregnancyType: PregnancyType
  numberOfBabies?: number
}

export interface MedicalHistoryInfo {
  preExistingConditions: PreExistingCondition[]
  previousPregnancyComplications: PregnancyComplication[]
  currentComplications: string
  medications: string
  foodAllergies: string
  medicationAllergies: string
  bloodType: BloodType | ''
  hasBloodClotHistory: boolean
}

export enum WeightCategory {
  UNDERWEIGHT = 'Underweight (BMI < 18.5)',
  NORMAL = 'Normal weight (BMI 18.5-24.9)',
  OVERWEIGHT = 'Overweight (BMI 25-29.9)',
  OBESE = 'Obese (BMI ≥ 30)',
  PREFER_NOT_TO_SAY = 'Prefer not to say',
}

export enum SubstanceUse {
  SMOKING = 'Smoking',
  ALCOHOL = 'Alcohol',
  RECREATIONAL_DRUGS = 'Recreational Drugs',
  NONE = 'None',
}

export enum ActivityLevel {
  SEDENTARY = 'Sedentary (little to no exercise)',
  LIGHT = 'Light (1-3 days/week)',
  MODERATE = 'Moderate (3-5 days/week)',
  ACTIVE = 'Active (6-7 days/week)',
  VERY_ACTIVE = 'Very Active (intense daily exercise)',
}

export enum DietaryRestriction {
  VEGETARIAN = 'Vegetarian',
  VEGAN = 'Vegan',
  GLUTEN_FREE = 'Gluten-Free',
  DAIRY_FREE = 'Dairy-Free',
  KOSHER = 'Kosher',
  HALAL = 'Halal',
  NONE = 'None',
}

export enum WorkPhysicalDemand {
  SEDENTARY = 'Sedentary (desk work)',
  LIGHT = 'Light (occasional standing/walking)',
  MODERATE = 'Moderate (frequent standing/walking)',
  HEAVY = 'Heavy (lifting, physical labor)',
}

export interface LifestyleDemographicsInfo {
  age: number | ''
  weightCategory: WeightCategory | ''
  substanceUseHistory: SubstanceUse[]
  activityLevel: ActivityLevel | ''
  hasExerciseRestrictions: boolean
  exerciseRestrictionsDetails: string
  dietaryRestrictions: DietaryRestriction[]
  workPhysicalDemand: WorkPhysicalDemand | ''
  workChemicalExposure: boolean
  workChemicalExposureDetails: string
  additionalNotes: string
}
