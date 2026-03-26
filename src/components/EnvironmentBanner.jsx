import React from 'react';
import { Alert } from '@mui/material';

/**
 * EnvironmentBanner — UX Research R4: Environment Status Banner
 *
 * Shows a persistent banner indicating the current environment.
 * Hidden in PROD. Uses MUI Alert.
 */

const ENV_CONFIG = {
  DEV:  { severity: 'info',    message: 'Development Environment — DEV' },
  PAT:  { severity: 'info',    message: 'PAT Environment — QA Sanity Testing' },
  SIT:  { severity: 'info',    message: 'SIT/UAT Environment — Integration Testing' },
  UAT:  { severity: 'warning', message: 'SIT/UAT Environment — User Acceptance Testing' },
  PROD: null, // hidden in production
};

const EnvironmentBanner = () => {
  const env = (import.meta.env.VITE_APP_ENV || 'DEV').toUpperCase();
  const config = ENV_CONFIG[env];

  if (!config) return null;

  return (
    <Alert severity={config.severity} sx={{ borderRadius: 0, py: 0.5 }}>
      {config.message}
    </Alert>
  );
};

export default EnvironmentBanner;
