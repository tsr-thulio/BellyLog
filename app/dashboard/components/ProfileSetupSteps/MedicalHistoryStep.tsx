import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import {
  PreExistingCondition,
  PregnancyComplication,
  BloodType,
} from '@/types/profile'
import { profileSetupModalStyles } from '../ProfileSetupModal.styles'

interface MedicalHistoryStepProps {
  preExistingConditions: PreExistingCondition[]
  setPreExistingConditions: (value: PreExistingCondition[]) => void
  previousPregnancyComplications: PregnancyComplication[]
  setPreviousPregnancyComplications: (value: PregnancyComplication[]) => void
  currentComplications: string
  setCurrentComplications: (value: string) => void
  medications: string
  setMedications: (value: string) => void
  foodAllergies: string
  setFoodAllergies: (value: string) => void
  medicationAllergies: string
  setMedicationAllergies: (value: string) => void
  bloodType: BloodType | ''
  setBloodType: (value: BloodType) => void
  hasBloodClotHistory: boolean
  setHasBloodClotHistory: (value: boolean) => void
}

export default function MedicalHistoryStep({
  preExistingConditions,
  setPreExistingConditions,
  previousPregnancyComplications,
  setPreviousPregnancyComplications,
  currentComplications,
  setCurrentComplications,
  medications,
  setMedications,
  foodAllergies,
  setFoodAllergies,
  medicationAllergies,
  setMedicationAllergies,
  bloodType,
  setBloodType,
  hasBloodClotHistory,
  setHasBloodClotHistory,
}: MedicalHistoryStepProps) {
  const handlePreExistingConditionChange = (condition: PreExistingCondition) => {
    setPreExistingConditions(
      preExistingConditions.includes(condition)
        ? preExistingConditions.filter((c) => c !== condition)
        : [...preExistingConditions, condition]
    )
  }

  const handlePregnancyComplicationChange = (complication: PregnancyComplication) => {
    setPreviousPregnancyComplications(
      previousPregnancyComplications.includes(complication)
        ? previousPregnancyComplications.filter((c) => c !== complication)
        : [...previousPregnancyComplications, complication]
    )
  }

  return (
    <Box sx={profileSetupModalStyles.stepContent}>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={profileSetupModalStyles.stepDescriptionShort}
      >
        🏥 Your health matters! Share your medical background so we can provide better support.
      </Typography>

      <Box sx={profileSetupModalStyles.formGrid}>
        {/* Pre-existing Conditions */}
        <Box sx={{ ...profileSetupModalStyles.formField, gridColumn: { xs: '1', md: '1 / -1' } }}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">Pre-existing Conditions</FormLabel>
            <FormGroup>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 1 }}>
                {Object.values(PreExistingCondition).map((condition) => (
                  <FormControlLabel
                    key={condition}
                    control={
                      <Checkbox
                        checked={preExistingConditions.includes(condition)}
                        onChange={() => handlePreExistingConditionChange(condition)}
                      />
                    }
                    label={condition}
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                ))}
              </Box>
            </FormGroup>
          </FormControl>
        </Box>

        {/* Previous Pregnancy Complications */}
        <Box sx={{ ...profileSetupModalStyles.formField, gridColumn: { xs: '1', md: '1 / -1' } }}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">Previous Pregnancy Complications</FormLabel>
            <FormGroup>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 1 }}>
                {Object.values(PregnancyComplication).map((complication) => (
                  <FormControlLabel
                    key={complication}
                    control={
                      <Checkbox
                        checked={previousPregnancyComplications.includes(complication)}
                        onChange={() => handlePregnancyComplicationChange(complication)}
                      />
                    }
                    label={complication}
                    sx={{
                      '& .MuiFormControlLabel-label': {
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                ))}
              </Box>
            </FormGroup>
          </FormControl>
        </Box>

        {/* Current Pregnancy Complications */}
        <Box sx={{ ...profileSetupModalStyles.formField, gridColumn: { xs: '1', md: '1 / -1' } }}>
          <TextField
            label="Current Pregnancy Complications or Diagnoses"
            multiline
            rows={2}
            fullWidth
            value={currentComplications}
            onChange={(e) => setCurrentComplications(e.target.value)}
            placeholder="List any current complications or diagnoses..."
          />
        </Box>

        {/* Medications */}
        <Box sx={{ ...profileSetupModalStyles.formField, gridColumn: { xs: '1', md: '1 / -1' } }}>
          <TextField
            label="Medications Currently Taking"
            multiline
            rows={2}
            fullWidth
            value={medications}
            onChange={(e) => setMedications(e.target.value)}
            placeholder="List all medications you are currently taking..."
          />
        </Box>

        {/* Food Allergies */}
        <Box sx={profileSetupModalStyles.formField}>
          <TextField
            label="Food Allergies"
            fullWidth
            value={foodAllergies}
            onChange={(e) => setFoodAllergies(e.target.value)}
            placeholder="e.g., peanuts, shellfish..."
          />
        </Box>

        {/* Medication Allergies */}
        <Box sx={profileSetupModalStyles.formField}>
          <TextField
            label="Medication Allergies"
            fullWidth
            value={medicationAllergies}
            onChange={(e) => setMedicationAllergies(e.target.value)}
            placeholder="e.g., penicillin, aspirin..."
          />
        </Box>

        {/* Blood Type */}
        <Box sx={profileSetupModalStyles.formField}>
          <FormControl fullWidth>
            <InputLabel id="blood-type-label">Blood Type & Rh Factor</InputLabel>
            <Select
              labelId="blood-type-label"
              value={bloodType}
              label="Blood Type & Rh Factor"
              onChange={(e) => setBloodType(e.target.value as BloodType)}
            >
              {Object.values(BloodType).map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Blood Clot History */}
        <Box sx={profileSetupModalStyles.formField}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">Blood Clot History</FormLabel>
            <FormControlLabel
              control={
                <Switch
                  checked={hasBloodClotHistory}
                  onChange={(e) => setHasBloodClotHistory(e.target.checked)}
                />
              }
              label={hasBloodClotHistory ? 'Yes, I have a history' : 'No history'}
              sx={{
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.875rem',
                },
              }}
            />
          </FormControl>
        </Box>
      </Box>
    </Box>
  )
}
