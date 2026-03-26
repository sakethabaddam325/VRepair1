import React, { useMemo } from 'react';
import { Box, Stepper, Step, StepLabel } from '@mui/material';

/**
 * TicketTimeline — UX Research R3: Real-Time Ticket Status Timeline
 *
 * Renders a horizontal Stepper below the CustomerInfoHeader
 * showing the ticket lifecycle stages.
 */
const LIFECYCLE_STAGES = [
  'Reported',
  'Acknowledged',
  'In Progress',
  'Dispatched',
  'Restored',
  'Closed',
];

/** Maps vRepair ticket status codes to lifecycle stage index */
const STATUS_TO_STAGE = {
  'OPN': 1,     // Acknowledged
  'WRK': 2,     // In Progress
  'DSP': 3,     // Dispatched
  'RST': 4,     // Restored
  'CLD': 5,     // Closed
  'CAN': 5,     // Cancelled (treated as closed)
};

const TicketTimeline = ({ ticketStatus = '', className, sx }) => { // eslint-disable-line no-unused-vars
  const activeStep = useMemo(() => {
    return STATUS_TO_STAGE[ticketStatus] ?? 0;
  }, [ticketStatus]);

  return (
    <Box sx={{ px: 1, py: 0.5, ...(sx || {}) }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ py: 1 }}>
        {LIFECYCLE_STAGES.map((label) => (
          <Step key={label}>
            <StepLabel
              sx={{
                '& .MuiStepLabel-label': { fontSize: (theme) => theme.typography.caption.fontSize },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default TicketTimeline;
