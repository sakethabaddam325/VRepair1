import React from 'react';
import { Box } from '@mui/material';

import logoUrl from '../assets/vrepair-logo.png';

/**
 * VRepairLogo — renders the brand logo image in the global header.
 */
function VRepairLogo() {
  return (
    <Box
      component="img"
      src={logoUrl}
      alt="VRepair"
      sx={{ height: 32, width: 'auto', userSelect: 'none', display: 'block' }}
    />
  );
}

export { VRepairLogo };
export default VRepairLogo;
