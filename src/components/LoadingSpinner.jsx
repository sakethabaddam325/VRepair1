import React from 'react';
import { Stack, Typography, CircularProgress } from '@mui/material';

const LoadingSpinner = ({ message = 'Loading...', isVisible = true }) => {
  if (!isVisible) return null;

  return (
    <Stack
      direction="column"
      alignItems="center"
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        gap: 1.5,
        p: 2.5,
        bgcolor: 'background.default',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 0.75,
        boxShadow: 2,
        zIndex: 99999,
        fontSize: (theme) => theme.typography.body1.fontSize,
        color: 'text.primary',
      }}
    >
      <CircularProgress size={20} />
      <Typography component="span">{message}</Typography>
    </Stack>
  );
};

export default LoadingSpinner;
