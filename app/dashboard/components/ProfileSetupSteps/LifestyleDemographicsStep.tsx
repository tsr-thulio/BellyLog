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
  WeightCategory,
  SubstanceUse,
  ActivityLevel,
  DietaryRestriction,
  WorkPhysicalDemand,
} from '@/types/profile'
import { profileSetupModalStyles } from '../ProfileSetupModal.styles'

interface LifestyleDemographicsStepProps {
  age: number | ''
  setAge: (value: number | '') => void
  weightCategory: WeightCategory | ''
  setWeightCategory: (value: WeightCategory) => void
  substanceUseHistory: SubstanceUse[]
  setSubstanceUseHistory: (value: SubstanceUse[]) => void
  activityLevel: ActivityLevel | ''
  setActivityLevel: (value: ActivityLevel) => void
  hasExerciseRestrictions: boolean
  setHasExerciseRestrictions: (value: boolean) => void
  exerciseRestrictionsDetails: string
  setExerciseRestrictionsDetails: (value: string) => void
  dietaryRestrictions: DietaryRestriction[]
  setDietaryRestrictions: (value: DietaryRestriction[]) => void
  workPhysicalDemand: WorkPhysicalDemand | ''
  setWorkPhysicalDemand: (value: WorkPhysicalDemand) => void
  workChemicalExposure: boolean
  setWorkChemicalExposure: (value: boolean) => void
  workChemicalExposureDetails: string
  setWorkChemicalExposureDetails: (value: string) => void
  additionalNotes: string
  setAdditionalNotes: (value: string) => void
}

export default function LifestyleDemographicsStep({
  age,
  setAge,
  weightCategory,
  setWeightCategory,
  substanceUseHistory,
  setSubstanceUseHistory,
  activityLevel,
  setActivityLevel,
  hasExerciseRestrictions,
  setHasExerciseRestrictions,
  exerciseRestrictionsDetails,
  setExerciseRestrictionsDetails,
  dietaryRestrictions,
  setDietaryRestrictions,
  workPhysicalDemand,
  setWorkPhysicalDemand,
  workChemicalExposure,
  setWorkChemicalExposure,
  workChemicalExposureDetails,
  setWorkChemicalExposureDetails,
  additionalNotes,
  setAdditionalNotes,
}: LifestyleDemographicsStepProps) {
  const handleSubstanceUseChange = (substance: SubstanceUse) => {
    if (substance === SubstanceUse.NONE) {
      setSubstanceUseHistory([SubstanceUse.NONE])
    } else {
      const filtered = substanceUseHistory.filter((s) => s !== SubstanceUse.NONE)
      setSubstanceUseHistory(
        filtered.includes(substance)
          ? filtered.filter((s) => s !== substance)
          : [...filtered, substance]
      )
    }
  }

  const handleDietaryRestrictionChange = (restriction: DietaryRestriction) => {
    if (restriction === DietaryRestriction.NONE) {
      setDietaryRestrictions([DietaryRestriction.NONE])
    } else {
      const filtered = dietaryRestrictions.filter((r) => r !== DietaryRestriction.NONE)
      setDietaryRestrictions(
        filtered.includes(restriction)
          ? filtered.filter((r) => r !== restriction)
          : [...filtered, restriction]
      )
    }
  }

  return (
    <Box sx={profileSetupModalStyles.stepContent}>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={profileSetupModalStyles.stepDescriptionShort}
      >
        💫 Almost there! Help us get to know you better for a personalized experience.
      </Typography>

      <Box sx={profileSetupModalStyles.formGrid}>
        {/* === DROPDOWNS === */}

        {/* Age */}
        <Box sx={profileSetupModalStyles.formField}>
          <TextField
            label="Age"
            type="number"
            fullWidth
            required
            value={age}
            onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : '')}
            inputProps={{ min: 18, max: 60 }}
            helperText="Advanced maternal age is 35+"
          />
        </Box>

        {/* Weight Category / BMI */}
        <Box sx={profileSetupModalStyles.formField}>
          <FormControl fullWidth required>
            <InputLabel id="weight-category-label">Weight Category (BMI)</InputLabel>
            <Select
              labelId="weight-category-label"
              value={weightCategory}
              label="Weight Category (BMI)"
              onChange={(e) => setWeightCategory(e.target.value as WeightCategory)}
            >
              {Object.values(WeightCategory).map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Activity Level */}
        <Box sx={profileSetupModalStyles.formField}>
          <FormControl fullWidth required>
            <InputLabel id="activity-level-label">Activity Level</InputLabel>
            <Select
              labelId="activity-level-label"
              value={activityLevel}
              label="Activity Level"
              onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
            >
              {Object.values(ActivityLevel).map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Work Physical Demand */}
        <Box sx={profileSetupModalStyles.formField}>
          <FormControl fullWidth>
            <InputLabel id="work-physical-demand-label">Work Physical Demands</InputLabel>
            <Select
              labelId="work-physical-demand-label"
              value={workPhysicalDemand}
              label="Work Physical Demands"
              onChange={(e) => setWorkPhysicalDemand(e.target.value as WorkPhysicalDemand)}
            >
              {Object.values(WorkPhysicalDemand).map((demand) => (
                <MenuItem key={demand} value={demand}>
                  {demand}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* === CHECKBOXES === */}

        {/* Substance Use History */}
        <Box sx={{ ...profileSetupModalStyles.formField, gridColumn: { xs: '1', md: '1 / -1' } }}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">Smoking, Alcohol, or Substance Use History</FormLabel>
            <FormGroup>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 1 }}>
                {Object.values(SubstanceUse).map((substance) => (
                  <FormControlLabel
                    key={substance}
                    control={
                      <Checkbox
                        checked={substanceUseHistory.includes(substance)}
                        onChange={() => handleSubstanceUseChange(substance)}
                      />
                    }
                    label={substance}
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

        {/* Dietary Restrictions */}
        <Box sx={{ ...profileSetupModalStyles.formField, gridColumn: { xs: '1', md: '1 / -1' } }}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">Dietary Restrictions</FormLabel>
            <FormGroup>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 1 }}>
                {Object.values(DietaryRestriction).map((restriction) => (
                  <FormControlLabel
                    key={restriction}
                    control={
                      <Checkbox
                        checked={dietaryRestrictions.includes(restriction)}
                        onChange={() => handleDietaryRestrictionChange(restriction)}
                      />
                    }
                    label={restriction}
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

        {/* === TOGGLES === */}

        {/* Exercise Restrictions */}
        <Box sx={profileSetupModalStyles.formField}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">Exercise Restrictions</FormLabel>
            <FormControlLabel
              control={
                <Switch
                  checked={hasExerciseRestrictions}
                  onChange={(e) => setHasExerciseRestrictions(e.target.checked)}
                />
              }
              label={hasExerciseRestrictions ? 'Yes, I have restrictions' : 'No restrictions'}
              sx={{
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.875rem',
                },
              }}
            />
          </FormControl>
        </Box>

        {/* Chemical Exposure */}
        <Box sx={profileSetupModalStyles.formField}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">Work Chemical Exposure</FormLabel>
            <FormControlLabel
              control={
                <Switch
                  checked={workChemicalExposure}
                  onChange={(e) => setWorkChemicalExposure(e.target.checked)}
                />
              }
              label={workChemicalExposure ? 'Yes, exposed to chemicals' : 'No exposure'}
              sx={{
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.875rem',
                },
              }}
            />
          </FormControl>
        </Box>

        {/* === OPEN TEXT FIELDS === */}

        {/* Exercise Restrictions Details (conditional) */}
        {hasExerciseRestrictions && (
          <Box sx={{ ...profileSetupModalStyles.formField, gridColumn: { xs: '1', md: '1 / -1' } }}>
            <TextField
              label="Exercise Restrictions Details"
              multiline
              rows={2}
              fullWidth
              value={exerciseRestrictionsDetails}
              onChange={(e) => setExerciseRestrictionsDetails(e.target.value)}
              placeholder="Please describe your exercise restrictions..."
            />
          </Box>
        )}

        {/* Chemical Exposure Details (conditional) */}
        {workChemicalExposure && (
          <Box sx={{ ...profileSetupModalStyles.formField, gridColumn: { xs: '1', md: '1 / -1' } }}>
            <TextField
              label="Chemical Exposure Details"
              multiline
              rows={2}
              fullWidth
              value={workChemicalExposureDetails}
              onChange={(e) => setWorkChemicalExposureDetails(e.target.value)}
              placeholder="Please describe the types of chemicals or hazards..."
            />
          </Box>
        )}

        {/* Additional Notes */}
        <Box sx={{ ...profileSetupModalStyles.formField, gridColumn: { xs: '1', md: '1 / -1' } }}>
          <TextField
            label="Additional Information"
            multiline
            rows={3}
            fullWidth
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder="Anything else you'd like us to know about your lifestyle, health, or pregnancy..."
          />
        </Box>
      </Box>
    </Box>
  )
}
