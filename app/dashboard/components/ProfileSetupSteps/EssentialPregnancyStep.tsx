import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { Dayjs } from 'dayjs'
import { ConceptionType } from '@/types/profile'
import { profileSetupModalStyles } from '../ProfileSetupModal.styles'

interface EssentialPregnancyStepProps {
  lastPeriod: Dayjs | null
  setLastPeriod: (value: Dayjs | null) => void
  previousPregnancies: number
  setPreviousPregnancies: (value: number) => void
  conceptionType: ConceptionType | ''
  setConceptionType: (value: ConceptionType) => void
  isMultiplePregnancy: boolean
  setIsMultiplePregnancy: (value: boolean) => void
  numberOfBabies: number
  setNumberOfBabies: (value: number) => void
}

export default function EssentialPregnancyStep({
  lastPeriod,
  setLastPeriod,
  previousPregnancies,
  setPreviousPregnancies,
  conceptionType,
  setConceptionType,
  isMultiplePregnancy,
  setIsMultiplePregnancy,
  numberOfBabies,
  setNumberOfBabies,
}: EssentialPregnancyStepProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={profileSetupModalStyles.stepContent}>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={profileSetupModalStyles.stepDescription}
        >
          ✨ Let's start with the basics! Tell us about your pregnancy journey.
        </Typography>

        <Box sx={profileSetupModalStyles.formGrid}>
          {/* Last Period Date Picker */}
          <Box sx={profileSetupModalStyles.formField}>
            <DatePicker
              label="Last Period"
              value={lastPeriod}
              onChange={(newValue) => setLastPeriod(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                },
              }}
            />
          </Box>

          {/* Number of Previous Pregnancies */}
          <Box sx={profileSetupModalStyles.formField}>
            <TextField
              label="Number of Previous Pregnancies"
              type="number"
              fullWidth
              required
              value={previousPregnancies}
              onChange={(e) =>
                setPreviousPregnancies(Math.max(0, parseInt(e.target.value) || 0))
              }
              inputProps={{ min: 0 }}
            />
          </Box>

          {/* Type of Conception */}
          <Box sx={profileSetupModalStyles.formField}>
            <FormControl fullWidth required>
              <InputLabel id="conception-type-label">
                Type of Conception
              </InputLabel>
              <Select
                labelId="conception-type-label"
                value={conceptionType}
                label="Type of Conception"
                onChange={(e) =>
                  setConceptionType(e.target.value as ConceptionType)
                }
              >
                {Object.values(ConceptionType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Single/Multiple Pregnancy Toggle */}
          <Box sx={profileSetupModalStyles.formField}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">Pregnancy Type</FormLabel>
              <FormControlLabel
                control={
                  <Switch
                    checked={isMultiplePregnancy}
                    onChange={(e) => setIsMultiplePregnancy(e.target.checked)}
                  />
                }
                label={isMultiplePregnancy ? 'Multiple Pregnancy' : 'Single Pregnancy'}
                sx={{
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.875rem',
                  },
                }}
              />
            </FormControl>
          </Box>

          {/* Number of Babies (conditional) */}
          {isMultiplePregnancy && (
            <Box sx={profileSetupModalStyles.formField}>
              <TextField
                label="Number of Babies"
                type="number"
                fullWidth
                required
                value={numberOfBabies}
                onChange={(e) =>
                  setNumberOfBabies(Math.max(2, parseInt(e.target.value) || 2))
                }
                inputProps={{ min: 2 }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </LocalizationProvider>
  )
}
