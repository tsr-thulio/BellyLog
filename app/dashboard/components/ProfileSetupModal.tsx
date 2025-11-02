'use client'

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material'
import { useState, useEffect } from 'react'
import { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import {
  ConceptionType,
  PreExistingCondition,
  PregnancyComplication,
  BloodType,
  WeightCategory,
  SubstanceUse,
  ActivityLevel,
  DietaryRestriction,
  WorkPhysicalDemand,
  PregnancyType,
} from '@/types/profile'
import { PROFILE_SETUP_STEPS } from '@/constants/profile'
import { profileSetupModalStyles } from './ProfileSetupModal.styles'
import EssentialPregnancyStep from './ProfileSetupSteps/EssentialPregnancyStep'
import MedicalHistoryStep from './ProfileSetupSteps/MedicalHistoryStep'
import LifestyleDemographicsStep from './ProfileSetupSteps/LifestyleDemographicsStep'
import { createProfile, updateProfile, Profile } from '@/lib/api/profile'

interface ProfileSetupModalProps {
  open: boolean
  onClose: () => void
  onSave: () => void
  initialProfile?: Profile | null
}

export default function ProfileSetupModal({
  open,
  onClose,
  onSave,
  initialProfile,
}: ProfileSetupModalProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [saving, setSaving] = useState(false)

  // Essential Pregnancy Information state
  const [lastPeriod, setLastPeriod] = useState<Dayjs | null>(null)
  const [previousPregnancies, setPreviousPregnancies] = useState<number>(0)
  const [conceptionType, setConceptionType] = useState<ConceptionType | ''>('')
  const [isMultiplePregnancy, setIsMultiplePregnancy] = useState(false)
  const [numberOfBabies, setNumberOfBabies] = useState<number>(2)

  // Medical History state
  const [preExistingConditions, setPreExistingConditions] = useState<PreExistingCondition[]>([])
  const [previousPregnancyComplications, setPreviousPregnancyComplications] = useState<PregnancyComplication[]>([])
  const [currentComplications, setCurrentComplications] = useState('')
  const [medications, setMedications] = useState('')
  const [foodAllergies, setFoodAllergies] = useState('')
  const [medicationAllergies, setMedicationAllergies] = useState('')
  const [bloodType, setBloodType] = useState<BloodType | ''>('')
  const [hasBloodClotHistory, setHasBloodClotHistory] = useState(false)

  // Lifestyle & Demographics state
  const [age, setAge] = useState<number | ''>('')
  const [weightCategory, setWeightCategory] = useState<WeightCategory | ''>('')
  const [substanceUseHistory, setSubstanceUseHistory] = useState<SubstanceUse[]>([])
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | ''>('')
  const [hasExerciseRestrictions, setHasExerciseRestrictions] = useState(false)
  const [exerciseRestrictionsDetails, setExerciseRestrictionsDetails] = useState('')
  const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryRestriction[]>([])
  const [workPhysicalDemand, setWorkPhysicalDemand] = useState<WorkPhysicalDemand | ''>('')
  const [workChemicalExposure, setWorkChemicalExposure] = useState(false)
  const [workChemicalExposureDetails, setWorkChemicalExposureDetails] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')

  // Pre-fill form when editing existing profile
  useEffect(() => {
    if (initialProfile && open) {
      // Essential Pregnancy Information
      setLastPeriod(initialProfile.last_period ? dayjs(initialProfile.last_period) : null)
      setPreviousPregnancies(initialProfile.previous_pregnancies || 0)
      setConceptionType((initialProfile.conception_type as ConceptionType) || '')
      setIsMultiplePregnancy(initialProfile.pregnancy_type === 'multiple')
      setNumberOfBabies(initialProfile.number_of_babies || 2)

      // Medical History
      setPreExistingConditions((initialProfile.pre_existing_conditions as PreExistingCondition[]) || [])
      setPreviousPregnancyComplications((initialProfile.previous_pregnancy_complications as PregnancyComplication[]) || [])
      setCurrentComplications(initialProfile.current_complications || '')
      setMedications(initialProfile.medications || '')
      setFoodAllergies(initialProfile.food_allergies || '')
      setMedicationAllergies(initialProfile.medication_allergies || '')
      setBloodType((initialProfile.blood_type as BloodType) || '')
      setHasBloodClotHistory(initialProfile.has_blood_clot_history || false)

      // Lifestyle & Demographics
      setAge(initialProfile.age || '')
      setWeightCategory((initialProfile.weight_category as WeightCategory) || '')
      setSubstanceUseHistory((initialProfile.substance_use_history as SubstanceUse[]) || [])
      setActivityLevel((initialProfile.activity_level as ActivityLevel) || '')
      setHasExerciseRestrictions(initialProfile.has_exercise_restrictions || false)
      setExerciseRestrictionsDetails(initialProfile.exercise_restrictions_details || '')
      setDietaryRestrictions((initialProfile.dietary_restrictions as DietaryRestriction[]) || [])
      setWorkPhysicalDemand((initialProfile.work_physical_demand as WorkPhysicalDemand) || '')
      setWorkChemicalExposure(initialProfile.work_chemical_exposure || false)
      setWorkChemicalExposureDetails(initialProfile.work_chemical_exposure_details || '')
      setAdditionalNotes(initialProfile.additional_notes || '')
    } else if (!open) {
      // Reset form when modal is closed
      setActiveStep(0)
    }
  }, [initialProfile, open])

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        // Step 1: Essential Pregnancy Information
        return !!(
          lastPeriod &&
          conceptionType &&
          (!isMultiplePregnancy || numberOfBabies >= 2)
        )
      case 1:
        // Step 2: Medical History (no required fields)
        return true
      case 2:
        // Step 3: Lifestyle & Demographics
        return !!(
          age &&
          weightCategory &&
          activityLevel
        )
      default:
        return false
    }
  }

  const handleNext = () => {
    if (isStepValid(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1)
  }

  const handleSave = async () => {
    if (!isStepValid(activeStep)) {
      return
    }

    setSaving(true)

    try {
      // Prepare profile data
      const profileData = {
        // Essential Pregnancy Information
        last_period: lastPeriod?.toDate().toISOString() || null,
        previous_pregnancies: previousPregnancies,
        conception_type: conceptionType || null,
        pregnancy_type: isMultiplePregnancy ? PregnancyType.MULTIPLE : PregnancyType.SINGLE,
        number_of_babies: isMultiplePregnancy ? numberOfBabies : 1,
        // Medical History
        pre_existing_conditions: preExistingConditions,
        previous_pregnancy_complications: previousPregnancyComplications,
        current_complications: currentComplications || null,
        medications: medications || null,
        food_allergies: foodAllergies || null,
        medication_allergies: medicationAllergies || null,
        blood_type: bloodType || null,
        has_blood_clot_history: hasBloodClotHistory,
        // Lifestyle & Demographics
        age: age || null,
        weight_category: weightCategory || null,
        substance_use_history: substanceUseHistory,
        activity_level: activityLevel || null,
        has_exercise_restrictions: hasExerciseRestrictions,
        exercise_restrictions_details: exerciseRestrictionsDetails || null,
        dietary_restrictions: dietaryRestrictions,
        work_physical_demand: workPhysicalDemand || null,
        work_chemical_exposure: workChemicalExposure,
        work_chemical_exposure_details: workChemicalExposureDetails || null,
        additional_notes: additionalNotes || null,
        // Mark profile as completed
        profile_completed: true,
      }

      // Save profile via API
      if (initialProfile) {
        // Update existing profile
        await updateProfile(profileData)
      } else {
        // Create new profile
        await createProfile(profileData)
      }

      // Call the onSave callback to close modal
      onSave()
    } catch (error) {
      console.error('Error saving profile:', error)
      alert(error instanceof Error ? error.message : 'Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <EssentialPregnancyStep
            lastPeriod={lastPeriod}
            setLastPeriod={setLastPeriod}
            previousPregnancies={previousPregnancies}
            setPreviousPregnancies={setPreviousPregnancies}
            conceptionType={conceptionType}
            setConceptionType={setConceptionType}
            isMultiplePregnancy={isMultiplePregnancy}
            setIsMultiplePregnancy={setIsMultiplePregnancy}
            numberOfBabies={numberOfBabies}
            setNumberOfBabies={setNumberOfBabies}
          />
        )
      case 1:
        return (
          <MedicalHistoryStep
            preExistingConditions={preExistingConditions}
            setPreExistingConditions={setPreExistingConditions}
            previousPregnancyComplications={previousPregnancyComplications}
            setPreviousPregnancyComplications={setPreviousPregnancyComplications}
            currentComplications={currentComplications}
            setCurrentComplications={setCurrentComplications}
            medications={medications}
            setMedications={setMedications}
            foodAllergies={foodAllergies}
            setFoodAllergies={setFoodAllergies}
            medicationAllergies={medicationAllergies}
            setMedicationAllergies={setMedicationAllergies}
            bloodType={bloodType}
            setBloodType={setBloodType}
            hasBloodClotHistory={hasBloodClotHistory}
            setHasBloodClotHistory={setHasBloodClotHistory}
          />
        )
      case 2:
        return (
          <LifestyleDemographicsStep
            age={age}
            setAge={setAge}
            weightCategory={weightCategory}
            setWeightCategory={setWeightCategory}
            substanceUseHistory={substanceUseHistory}
            setSubstanceUseHistory={setSubstanceUseHistory}
            activityLevel={activityLevel}
            setActivityLevel={setActivityLevel}
            hasExerciseRestrictions={hasExerciseRestrictions}
            setHasExerciseRestrictions={setHasExerciseRestrictions}
            exerciseRestrictionsDetails={exerciseRestrictionsDetails}
            setExerciseRestrictionsDetails={setExerciseRestrictionsDetails}
            dietaryRestrictions={dietaryRestrictions}
            setDietaryRestrictions={setDietaryRestrictions}
            workPhysicalDemand={workPhysicalDemand}
            setWorkPhysicalDemand={setWorkPhysicalDemand}
            workChemicalExposure={workChemicalExposure}
            setWorkChemicalExposure={setWorkChemicalExposure}
            workChemicalExposureDetails={workChemicalExposureDetails}
            setWorkChemicalExposureDetails={setWorkChemicalExposureDetails}
            additionalNotes={additionalNotes}
            setAdditionalNotes={setAdditionalNotes}
          />
        )
      default:
        return null
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{ sx: profileSetupModalStyles.dialogPaper }}
    >
      <DialogTitle sx={profileSetupModalStyles.dialogTitle}>
        <Typography variant="h5" component="div" sx={profileSetupModalStyles.titleText}>
          Let's Set Up Your Profile! 🎉
        </Typography>
        <Typography variant="body2" sx={profileSetupModalStyles.dialogSubtitle}>
          Help us personalize your amazing pregnancy journey
        </Typography>
      </DialogTitle>

      <DialogContent sx={profileSetupModalStyles.dialogContent}>
        <Stepper activeStep={activeStep} sx={profileSetupModalStyles.stepper}>
          {PROFILE_SETUP_STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={profileSetupModalStyles.contentBox}>
          {getStepContent(activeStep)}
        </Box>
      </DialogContent>

      <DialogActions sx={profileSetupModalStyles.dialogActions}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          variant="outlined"
          sx={profileSetupModalStyles.previousButton}
        >
          ← Previous
        </Button>
        <Box sx={profileSetupModalStyles.spacer} />
        {activeStep === PROFILE_SETUP_STEPS.length - 1 ? (
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={!isStepValid(activeStep) || saving}
            sx={profileSetupModalStyles.nextButton}
          >
            {saving ? 'Saving...' : 'Complete Setup! 🎯'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            variant="contained"
            color="primary"
            disabled={!isStepValid(activeStep)}
            sx={profileSetupModalStyles.nextButton}
          >
            Next Step →
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
