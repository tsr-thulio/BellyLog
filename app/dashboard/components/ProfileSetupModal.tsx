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
import { useState } from 'react'
import { Dayjs } from 'dayjs'
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
} from '@/types/profile'
import { PROFILE_SETUP_STEPS } from '@/constants/profile'
import { profileSetupModalStyles } from './ProfileSetupModal.styles'
import EssentialPregnancyStep from './ProfileSetupSteps/EssentialPregnancyStep'
import MedicalHistoryStep from './ProfileSetupSteps/MedicalHistoryStep'
import LifestyleDemographicsStep from './ProfileSetupSteps/LifestyleDemographicsStep'

interface ProfileSetupModalProps {
  open: boolean
  onClose: () => void
  onSave: () => void
}

export default function ProfileSetupModal({
  open,
  onClose,
  onSave,
}: ProfileSetupModalProps) {
  const [activeStep, setActiveStep] = useState(0)

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

  const handleSave = () => {
    if (isStepValid(activeStep)) {
      onSave()
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
            disabled={!isStepValid(activeStep)}
            sx={profileSetupModalStyles.nextButton}
          >
            Complete Setup! 🎯
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
